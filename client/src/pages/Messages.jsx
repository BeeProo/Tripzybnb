import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getConversations, getMessages, sendMessage } from '../api';
import './Messages.css';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user]);

  // Auto-open conversation from URL query param (?convo=<id>)
  useEffect(() => {
    const convoId = searchParams.get('convo');
    if (convoId && conversations.length > 0) {
      const target = conversations.find((c) => c._id === convoId);
      if (target) {
        setActiveConvo(target);
        // Clean up URL
        setSearchParams({});
      }
    }
  }, [conversations, searchParams]);

  useEffect(() => {
    if (activeConvo) {
      fetchMessages(activeConvo._id);
    }
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await getConversations();
      setConversations(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convoId) => {
    try {
      const { data } = await getMessages(convoId);
      setMessages(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo || sending) return;

    setSending(true);
    try {
      const { data } = await sendMessage(activeConvo._id, { text: newMessage.trim() });
      setMessages((prev) => [...prev, data.data]);
      setNewMessage('');

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConvo._id
            ? { ...c, lastMessage: { text: newMessage.trim(), sender: user._id, createdAt: new Date().toISOString() } }
            : c
        )
      );
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getSenderIdentifier = (msg) => {
    // sender can be an object (populated) or a string (just the ID)
    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    return senderId;
  };

  if (loading)
    return (
      <div className="page">
        <div className="loader"><div className="spinner" /></div>
      </div>
    );

  return (
    <div className="page messages-page">
      <div className="container">
        <div className="page-header">
          <h1>💬 Messages</h1>
        </div>

        <div className="messages-layout">
          {/* Conversation List */}
          <aside className="convo-list">
            {conversations.length === 0 ? (
              <div className="convo-empty">
                <div className="convo-empty-icon">💬</div>
                <p>No conversations yet</p>
                <small>Start by messaging a host from their listing page</small>
              </div>
            ) : (
              conversations.map((convo) => {
                const otherUser = convo.participants?.find((p) => p._id !== user?._id);
                return (
                  <div
                    key={convo._id}
                    className={`convo-item ${activeConvo?._id === convo._id ? 'active' : ''}`}
                    onClick={() => setActiveConvo(convo)}
                  >
                    <div className="convo-avatar">
                      {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="convo-info">
                      <div className="convo-name-row">
                        <strong>{otherUser?.name || 'User'}</strong>
                        {convo.lastMessage?.createdAt && (
                          <span className="convo-time">
                            {new Date(convo.lastMessage.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <small>{convo.lastMessage?.text?.substring(0, 40) || 'No messages yet'}{convo.lastMessage?.text?.length > 40 ? '...' : ''}</small>
                      {convo.listing && (
                        <span className="convo-listing-tag">🏠 {convo.listing.title?.substring(0, 25)}{convo.listing.title?.length > 25 ? '...' : ''}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </aside>

          {/* Chat Area */}
          <div className="chat-area">
            {!activeConvo ? (
              <div className="chat-placeholder">
                <div className="chat-placeholder-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose from your existing conversations or start one from a listing page</p>
              </div>
            ) : (
              <>
                <div className="chat-header">
                  <div className="convo-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                    {activeConvo.participants?.find((p) => p._id !== user?._id)?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="chat-header-info">
                    <strong>{activeConvo.participants?.find((p) => p._id !== user?._id)?.name || 'User'}</strong>
                    {activeConvo.listing && (
                      <small className="chat-listing-label" onClick={() => navigate(`/listings/${activeConvo.listing._id}`)}>
                        🏠 {activeConvo.listing.title}
                      </small>
                    )}
                  </div>
                </div>
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div className="chat-start-prompt">
                      <p>👋 Say hi! Start the conversation.</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`chat-bubble ${getSenderIdentifier(msg) === user?._id ? 'sent' : 'received'}`}
                    >
                      <p>{msg.text}</p>
                      <small>
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form className="chat-input" onSubmit={handleSend}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    autoFocus
                    id="chat-message-input"
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()} id="chat-send-btn">
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
