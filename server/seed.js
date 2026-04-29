const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
const Booking = require('./src/models/Booking');
const Review = require('./src/models/Review');
const Wishlist = require('./src/models/Wishlist');
const Conversation = require('./src/models/Conversation');
const Message = require('./src/models/Message');
const HostRequest = require('./src/models/HostRequest');
const Notification = require('./src/models/Notification');

const seedData = async () => {
  try {
    await connectDB();

    // Clear ALL collections
    await User.deleteMany();
    await Listing.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await Wishlist.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();
    await HostRequest.deleteMany();
    await Notification.deleteMany();

    console.log('Cleared all existing data...');

    // Create users
    const users = await User.create([
      {
        name: 'Biprajit Das',
        email: 'admin@tripzybnb.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        avatar: 'https://ui-avatars.com/api/?name=Biprajit+Das&background=FF385C&color=fff',
      },
      {
        name: 'BeePro',
        email: 'beepro@user.com',
        password: 'password123',
        role: 'host',
        phone: '9123456789',
        avatar: 'https://ui-avatars.com/api/?name=BeePro&background=00A699&color=fff',
      },
      {
        name: 'Kishore Kumar',
        email: 'kishorekumar@user.com',
        password: 'password123',
        role: 'user',
        phone: '9988776655',
        avatar: 'https://ui-avatars.com/api/?name=Kishore+Kumar&background=FC642D&color=fff',
      },
    ]);

    const admin = users[0];
    const host = users[1];
    const guest = users[2];

    console.log('Created 3 users (admin, host, guest)...');

    // Helper: future date from today
    const futureDate = (daysFromNow) => {
      const d = new Date();
      d.setDate(d.getDate() + daysFromNow);
      return d;
    };
    const pastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    // Create listings — first 5 owned by host, rest by admin
    const listings = await Listing.create([
      {
        title: 'Luxury Oceanfront Villa',
        description: 'Stunning 4-bedroom villa with panoramic ocean views, private pool, and direct beach access. Perfect for a luxurious family getaway with world-class amenities and breathtaking sunsets.',
        location: { city: 'Goa', state: 'Goa', country: 'India' },
        price: 12500,
        maxGuests: 8,
        images: [
          'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Pool', 'Beach Access', 'Kitchen', 'Parking'],
        tags: ['luxury', 'beach', 'family'],
        createdBy: host._id,
      },
      {
        title: 'Cozy Mountain Cabin',
        description: 'A charming wooden cabin nestled in the Himalayas with stunning mountain views, fireplace, and hiking trails right at your doorstep. Ideal for adventure seekers and nature lovers.',
        location: { city: 'Manali', state: 'Himachal Pradesh', country: 'India' },
        price: 3500,
        maxGuests: 4,
        images: [
          'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
          'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
        ],
        amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Parking', 'Hiking'],
        tags: ['budget', 'mountain', 'adventure'],
        createdBy: host._id,
      },
      {
        title: 'Modern City Apartment',
        description: 'Sleek, fully-furnished apartment in the heart of Mumbai. Walking distance to restaurants, shopping, and nightlife. Features floor-to-ceiling windows with stunning skyline views.',
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        price: 5500,
        maxGuests: 3,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Gym', 'Elevator', 'Security'],
        tags: ['urban', 'business', 'luxury'],
        createdBy: host._id,
      },
      {
        title: 'Heritage Haveli Suite',
        description: 'Experience royal Rajasthani heritage in this beautifully restored haveli. Ornate architecture, traditional decor, courtyard dining, and impeccable hospitality await you.',
        location: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
        price: 8000,
        maxGuests: 4,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Restaurant', 'Room Service', 'Courtyard'],
        tags: ['heritage', 'luxury', 'culture'],
        createdBy: host._id,
      },
      {
        title: 'Backpacker Hostel Dorm',
        description: 'Budget-friendly hostel in the backpacker paradise of Rishikesh. Clean dorms, common kitchen, rooftop yoga sessions, and an amazing community of travelers from around the world.',
        location: { city: 'Rishikesh', state: 'Uttarakhand', country: 'India' },
        price: 800,
        maxGuests: 12,
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
          'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
        ],
        amenities: ['WiFi', 'Kitchen', 'Yoga', 'Laundry', 'Locker'],
        tags: ['budget', 'backpacker', 'adventure'],
        createdBy: host._id,
      },
      {
        title: 'Beachside Eco Resort',
        description: 'Sustainable bamboo cottages on a pristine Kerala beach. Wake up to the sound of waves, enjoy Ayurvedic spa treatments, and dine on fresh seafood under the stars.',
        location: { city: 'Varkala', state: 'Kerala', country: 'India' },
        price: 6500,
        maxGuests: 4,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
          'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
        ],
        amenities: ['WiFi', 'Beach Access', 'Spa', 'Restaurant', 'Eco-friendly'],
        tags: ['beach', 'eco', 'wellness'],
        createdBy: admin._id,
      },
      {
        title: 'Houseboat Deluxe',
        description: 'Cruise through the serene Kerala backwaters in a luxury houseboat. All-inclusive experience with a private chef, sundeck, and bedroom with panoramic water views.',
        location: { city: 'Alleppey', state: 'Kerala', country: 'India' },
        price: 9500,
        maxGuests: 4,
        images: [
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
          'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800',
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        ],
        amenities: ['AC', 'Private Chef', 'Sundeck', 'Room Service'],
        tags: ['luxury', 'unique', 'romantic'],
        createdBy: admin._id,
      },
      {
        title: 'Treehouse Retreat',
        description: 'A magical treehouse perched high in the Western Ghats. Surrounded by lush greenery, exotic birds, and the sounds of nature. An unforgettable experience for couples.',
        location: { city: 'Munnar', state: 'Kerala', country: 'India' },
        price: 4500,
        maxGuests: 2,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
        ],
        amenities: ['WiFi', 'Balcony', 'Nature Trails', 'Breakfast Included'],
        tags: ['unique', 'romantic', 'nature'],
        createdBy: admin._id,
      },
      {
        title: 'Business Hotel Premium',
        description: 'Premium business hotel in Bangalore\'s tech hub. Conference rooms, high-speed internet, airport shuttle, and a 24/7 business center. Perfect for corporate travelers.',
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        price: 7000,
        maxGuests: 2,
        images: [
          'https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=800',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Gym', 'Conference Room', 'Airport Shuttle', 'Restaurant'],
        tags: ['business', 'urban', 'premium'],
        createdBy: admin._id,
      },
      {
        title: 'Lakeside Cottage',
        description: 'Peaceful cottage overlooking Nainital Lake. Cozy interiors with a private garden, bonfire area, and stunning views of the Kumaon Hills. Perfect for a relaxing weekend.',
        location: { city: 'Nainital', state: 'Uttarakhand', country: 'India' },
        price: 3000,
        maxGuests: 6,
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        ],
        amenities: ['WiFi', 'Garden', 'Bonfire', 'Kitchen', 'Parking'],
        tags: ['budget', 'lake', 'nature', 'family'],
        createdBy: admin._id,
      },
      {
        title: 'Desert Camp Experience',
        description: 'Glamping under the stars in the Thar Desert. Luxury tents with attached bathrooms, camel rides, cultural performances, and a sumptuous Rajasthani dinner around the campfire.',
        location: { city: 'Jaisalmer', state: 'Rajasthan', country: 'India' },
        price: 5000,
        maxGuests: 6,
        images: [
          'https://images.unsplash.com/photo-1631635589499-afd87d52bf64?w=800',
          'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        ],
        amenities: ['Meals Included', 'Cultural Show', 'Camel Ride', 'Bonfire'],
        tags: ['unique', 'adventure', 'culture', 'desert'],
        createdBy: admin._id,
      },
      {
        title: 'Tea Plantation Bungalow',
        description: 'Colonial-era bungalow surrounded by rolling tea plantations in Darjeeling. Enjoy freshly brewed tea, stunning sunrise over Kanchenjunga, and heritage railway rides.',
        location: { city: 'Darjeeling', state: 'West Bengal', country: 'India' },
        price: 4000,
        maxGuests: 4,
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        ],
        amenities: ['WiFi', 'Garden', 'Tea Tasting', 'Breakfast Included', 'Parking'],
        tags: ['heritage', 'nature', 'mountain', 'romantic'],
        createdBy: admin._id,
      },
      {
        title: 'Penthouse Suite Downtown',
        description: 'Ultra-luxurious penthouse with a private terrace in central Delhi. Smart home features, premium furnishings, jacuzzi bath, and a dedicated concierge service.',
        location: { city: 'New Delhi', state: 'Delhi', country: 'India' },
        price: 15000,
        maxGuests: 4,
        images: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
          'https://images.unsplash.com/photo-1600566753086-00f18f6b6034?w=800',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Jacuzzi', 'Concierge', 'Smart Home', 'Terrace'],
        tags: ['luxury', 'urban', 'premium'],
        createdBy: admin._id,
      },
      {
        title: 'Riverside Bamboo Cottage',
        description: 'Eco-friendly bamboo cottage along the Brahmaputra tributary. Kayaking, fishing, birdwatching, and organic farm-to-table dining in the heart of Assam\'s wilderness.',
        location: { city: 'Kaziranga', state: 'Assam', country: 'India' },
        price: 2800,
        maxGuests: 4,
        images: [
          'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
        ],
        amenities: ['Meals Included', 'Kayaking', 'Birdwatching', 'Eco-friendly'],
        tags: ['eco', 'nature', 'adventure', 'budget'],
        createdBy: admin._id,
      },
      {
        title: 'Cliff-top Beach Resort',
        description: 'Perched on dramatic cliffs overlooking the Arabian Sea. Infinity pool, spa, multiple restaurants, and private beach access. The ultimate tropical luxury escape.',
        location: { city: 'Kovalam', state: 'Kerala', country: 'India' },
        price: 11000,
        maxGuests: 6,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Pool', 'Spa', 'Beach Access', 'Restaurant', 'Room Service'],
        tags: ['luxury', 'beach', 'wellness', 'romantic'],
        createdBy: admin._id,
      },
    ]);

    console.log(`Created ${listings.length} listings...`);

    // Create reviews
    const reviews = [];
    const reviewData = [
      { user: host, listing: listings[5], rating: 5, comment: 'Absolutely stunning resort! The eco-friendly approach was refreshing and the Ayurvedic spa was divine.' },
      { user: guest, listing: listings[0], rating: 5, comment: 'Breathtaking ocean views and the private pool was a highlight. Best villa I have ever stayed at!' },
      { user: guest, listing: listings[1], rating: 4, comment: 'Perfect mountain getaway! The cabin was cozy and the views were incredible. Great hiking trails nearby.' },
      { user: guest, listing: listings[2], rating: 4, comment: 'Great location in the heart of Mumbai. Modern and clean. Perfect for a business trip.' },
      { user: guest, listing: listings[3], rating: 5, comment: 'A truly royal experience! The haveli architecture is jaw-dropping. The courtyard dining was magical.' },
      { user: guest, listing: listings[4], rating: 4, comment: 'Best budget hostel I have stayed at. Met amazing people and the rooftop yoga was a bonus!' },
      { user: guest, listing: listings[5], rating: 5, comment: 'The eco resort is paradise on earth. Loved the sustainable approach and the Ayurvedic spa.' },
      { user: guest, listing: listings[6], rating: 5, comment: 'The houseboat experience was truly unique. The private chef prepared incredible Kerala cuisine.' },
      { user: guest, listing: listings[7], rating: 5, comment: 'Sleeping in a treehouse was a childhood dream come true! The nature sounds were soothing.' },
      { user: guest, listing: listings[8], rating: 3, comment: 'Good business hotel with all necessary amenities. A bit impersonal but very efficient.' },
      { user: guest, listing: listings[9], rating: 4, comment: 'The lake views were stunning. Very peaceful and perfect for a weekend escape from the city.' },
      { user: guest, listing: listings[10], rating: 5, comment: 'Desert camping was an unforgettable experience. The cultural show and camel ride were highlights!' },
      { user: guest, listing: listings[11], rating: 4, comment: 'Waking up to tea plantations was surreal. The Kanchenjunga sunrise was worth the early wake-up.' },
      { user: guest, listing: listings[12], rating: 5, comment: 'The penthouse is out of this world! Smart home features and the jacuzzi terrace were amazing.' },
      { user: guest, listing: listings[13], rating: 4, comment: 'Loved the bamboo cottage and kayaking on the river. The organic meals were delicious.' },
      { user: guest, listing: listings[14], rating: 5, comment: 'The infinity pool overlooking the ocean is Instagram-perfect. World-class resort experience.' },
      { user: host, listing: listings[6], rating: 5, comment: 'The houseboat was an unforgettable experience. Kerala backwaters are absolutely magical.' },
      { user: host, listing: listings[14], rating: 4, comment: 'Beautiful resort with excellent service. The cliff-top location is spectacular.' },
    ];

    for (const r of reviewData) {
      const review = await Review.create({
        user: r.user._id,
        listing: r.listing._id,
        rating: r.rating,
        comment: r.comment,
      });
      reviews.push(review);
    }

    console.log(`Created ${reviews.length} reviews...`);

    // Create bookings with paymentDetails
    const bookings = await Booking.create([
      {
        listing: listings[0]._id,
        user: guest._id,
        checkIn: pastDate(20),
        checkOut: pastDate(15),
        guests: 2,
        totalPrice: 5 * listings[0].price,
        status: 'confirmed',
        paymentDetails: {
          transactionId: 'pay_demo_' + Date.now() + '_1',
          status: 'captured',
          email: 'kishorekumar@user.com',
        },
      },
      {
        listing: listings[2]._id,
        user: guest._id,
        checkIn: futureDate(10),
        checkOut: futureDate(13),
        guests: 1,
        totalPrice: 3 * listings[2].price,
        status: 'confirmed',
        paymentDetails: {
          transactionId: 'pay_demo_' + Date.now() + '_2',
          status: 'captured',
          email: 'kishorekumar@user.com',
        },
      },
      {
        listing: listings[6]._id,
        user: guest._id,
        checkIn: futureDate(25),
        checkOut: futureDate(27),
        guests: 2,
        totalPrice: 2 * listings[6].price,
        status: 'confirmed',
        paymentDetails: {
          transactionId: 'pay_demo_' + Date.now() + '_3',
          status: 'captured',
          email: 'kishorekumar@user.com',
        },
      },
      {
        listing: listings[1]._id,
        user: guest._id,
        checkIn: pastDate(40),
        checkOut: pastDate(37),
        guests: 3,
        totalPrice: 3 * listings[1].price,
        status: 'cancelled',
      },
      {
        listing: listings[3]._id,
        user: guest._id,
        checkIn: futureDate(45),
        checkOut: futureDate(48),
        guests: 2,
        totalPrice: 3 * listings[3].price,
        status: 'pending',
      },
    ]);

    console.log(`Created ${bookings.length} bookings...`);

    // Create wishlist entries for guest
    const wishlists = await Wishlist.create([
      { user: guest._id, listing: listings[0]._id },
      { user: guest._id, listing: listings[7]._id },
      { user: guest._id, listing: listings[12]._id },
      { user: guest._id, listing: listings[14]._id },
    ]);

    console.log(`Created ${wishlists.length} wishlist entries...`);

    // Create a conversation between guest and host
    const conversation = await Conversation.create({
      participants: [guest._id, host._id],
      listing: listings[0]._id,
      lastMessage: {
        text: 'Looking forward to the stay!',
        sender: guest._id,
        createdAt: pastDate(2),
      },
    });

    // Create messages in the conversation
    const messages = await Message.create([
      {
        conversation: conversation._id,
        sender: guest._id,
        text: 'Hi! I am interested in booking the Oceanfront Villa. Is it available next month?',
        createdAt: pastDate(5),
      },
      {
        conversation: conversation._id,
        sender: host._id,
        text: 'Hello Kishore! Yes, the villa is available. We would love to host you. Let me know your preferred dates!',
        createdAt: pastDate(4),
      },
      {
        conversation: conversation._id,
        sender: guest._id,
        text: 'That sounds great! Looking forward to the stay!',
        createdAt: pastDate(2),
      },
    ]);

    console.log(`Created 1 conversation with ${messages.length} messages...`);

    // Create a sample host request (pending — for admin to demo approve/reject)
    const hostRequest = await HostRequest.create({
      user: host._id,
      propertyTitle: 'Sunrise Valley Homestay',
      propertyDescription: 'A charming homestay nestled in the Coorg hills with coffee plantation views, homemade Kodava cuisine, and guided plantation walks. Perfect for couples and families seeking an authentic Karnataka experience.',
      propertyType: 'Homestay',
      location: { city: 'Coorg', state: 'Karnataka', country: 'India', address: 'Madikeri Road, Coorg' },
      price: 3200,
      maxGuests: 4,
      amenities: ['WiFi', 'Kitchen', 'Garden', 'Breakfast Included', 'Parking', 'Nature Trails'],
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      ],
      phone: '9123456789',
      message: 'I would like to list my family homestay in Coorg. We have been hosting guests for 3 years and have excellent reviews on other platforms.',
      status: 'pending',
    });

    console.log('Created 1 pending host request...');

    // Create sample notifications
    const notifications = await Notification.create([
      {
        recipient: host._id,
        type: 'booking_new',
        title: 'New Booking!',
        body: `Kishore Kumar booked Luxury Oceanfront Villa for ₹${5 * listings[0].price}`,
        link: '/host/dashboard',
        read: false,
      },
      {
        recipient: host._id,
        type: 'booking_new',
        title: 'New Booking!',
        body: `Kishore Kumar booked Modern City Apartment for ₹${3 * listings[2].price}`,
        link: '/host/dashboard',
        read: true,
      },
      {
        recipient: host._id,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        body: 'Kishore Kumar cancelled their booking at Cozy Mountain Cabin',
        link: '/host/dashboard',
        read: true,
      },
      {
        recipient: guest._id,
        type: 'message',
        title: 'New Message from BeePro',
        body: 'Hello Kishore! Yes, the villa is available...',
        link: '/messages',
        read: false,
      },
    ]);

    console.log(`Created ${notifications.length} notifications...`);

    console.log('\n========================================');
    console.log('         SEED COMPLETE');
    console.log('========================================');
    console.log(`  Users:          3 (admin, host, guest)`);
    console.log(`  Listings:       ${listings.length} (5 by host, 10 by admin)`);
    console.log(`  Reviews:        ${reviews.length}`);
    console.log(`  Bookings:       ${bookings.length} (3 confirmed, 1 cancelled, 1 pending)`);
    console.log(`  Wishlists:      ${wishlists.length}`);
    console.log(`  Conversations:  1 (with ${messages.length} messages)`);
    console.log(`  Host Requests:  1 (pending)`);
    console.log(`  Notifications:  ${notifications.length}`);
    console.log('========================================');
    console.log('  Admin:  admin@tripzybnb.com / admin123');
    console.log('  Host:   beepro@user.com / password123');
    console.log('  Guest:  kishorekumar@user.com / password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
