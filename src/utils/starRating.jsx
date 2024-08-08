function StarRating({ value }) {
  const totalStars = 5;
  const stars = [];

  for (let i = 1; i <= totalStars; i++) {
    if (value >= i) {
      stars.push("full");
    } else if (value >= i - 0.5) {
      stars.push("half");
    } else {
      stars.push("blank");
    }
  }

  const starIcons = {
    full: "/assets/star-full-icon.svg",
    half: "/assets/star-half-icon.svg",
    blank: "/assets/star-blank-icon.svg",
  };

  return (
    <div className="d-flex gap-1">
      {stars.map((star, index) => (
        <img
          key={index}
          src={process.env.PUBLIC_URL + starIcons[star]}
          alt={`star-${star}-icon`}
          className="icons"
        />
      ))}
    </div>
  );
}

export default StarRating;
