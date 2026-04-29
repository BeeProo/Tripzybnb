export default function StarRating({ rating, size = 16 }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<span key={i} style={{ color: '#FFB400', fontSize: size }}>★</span>);
    } else if (i === full && half) {
      stars.push(<span key={i} style={{ color: '#FFB400', fontSize: size }}>★</span>);
    } else {
      stars.push(<span key={i} style={{ color: '#DDD', fontSize: size }}>★</span>);
    }
  }

  return <span className="stars">{stars}</span>;
}
