const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
const Booking = require('./src/models/Booking');
const Review = require('./src/models/Review');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Listing.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    console.log('Cleared existing data...');

    // Create users
    const users = await User.create([
      {
        name: 'Biprajit Das',
        email: 'admin@tripzybnb.com',
        password: 'admin123',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Biprajit+Das&background=FF385C&color=fff',
      },
      {
        name: 'BeePro',
        email: 'beepro@user.com',
        password: 'password123',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=BeePro&background=00A699&color=fff',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=FC642D&color=fff',
      },
    ]);

    const admin = users[0];
    const john = users[1];
    const jane = users[2];

    console.log('Created users...');

    // Create listings
    const listings = await Listing.create([
      {
        title: 'Luxury Oceanfront Villa',
        description: 'Stunning 4-bedroom villa with panoramic ocean views, private pool, and direct beach access. Perfect for a luxurious family getaway with world-class amenities and breathtaking sunsets.',
        location: { city: 'Goa', state: 'Goa', country: 'India' },
        price: 12500,
        images: [
          'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Pool', 'Beach Access', 'Kitchen', 'Parking'],
        tags: ['luxury', 'beach', 'family'],
        createdBy: admin._id,
      },
      {
        title: 'Cozy Mountain Cabin',
        description: 'A charming wooden cabin nestled in the Himalayas with stunning mountain views, fireplace, and hiking trails right at your doorstep. Ideal for adventure seekers and nature lovers.',
        location: { city: 'Manali', state: 'Himachal Pradesh', country: 'India' },
        price: 3500,
        images: [
          'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
          'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
        ],
        amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Parking', 'Hiking'],
        tags: ['budget', 'mountain', 'adventure'],
        createdBy: admin._id,
      },
      {
        title: 'Modern City Apartment',
        description: 'Sleek, fully-furnished apartment in the heart of Mumbai. Walking distance to restaurants, shopping, and nightlife. Features floor-to-ceiling windows with stunning skyline views.',
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        price: 5500,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Gym', 'Elevator', 'Security'],
        tags: ['urban', 'business', 'luxury'],
        createdBy: admin._id,
      },
      {
        title: 'Heritage Haveli Suite',
        description: 'Experience royal Rajasthani heritage in this beautifully restored haveli. Ornate architecture, traditional decor, courtyard dining, and impeccable hospitality await you.',
        location: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
        price: 8000,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Restaurant', 'Room Service', 'Courtyard'],
        tags: ['heritage', 'luxury', 'culture'],
        createdBy: admin._id,
      },
      {
        title: 'Backpacker Hostel Dorm',
        description: 'Budget-friendly hostel in the backpacker paradise of Rishikesh. Clean dorms, common kitchen, rooftop yoga sessions, and an amazing community of travelers from around the world.',
        location: { city: 'Rishikesh', state: 'Uttarakhand', country: 'India' },
        price: 800,
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
          'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
        ],
        amenities: ['WiFi', 'Kitchen', 'Yoga', 'Laundry', 'Locker'],
        tags: ['budget', 'backpacker', 'adventure'],
        createdBy: admin._id,
      },
      {
        title: 'Beachside Eco Resort',
        description: 'Sustainable bamboo cottages on a pristine Kerala beach. Wake up to the sound of waves, enjoy Ayurvedic spa treatments, and dine on fresh seafood under the stars.',
        location: { city: 'Varkala', state: 'Kerala', country: 'India' },
        price: 6500,
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
      { user: john, listing: listings[0], rating: 5, comment: 'Absolutely stunning villa! The ocean views were breathtaking and the private pool was a highlight. Will definitely return.' },
      { user: jane, listing: listings[0], rating: 4, comment: 'Beautiful property with excellent amenities. The beach access was fantastic. Only minor issue was the WiFi speed.' },
      { user: john, listing: listings[1], rating: 4, comment: 'Perfect mountain getaway! The cabin was cozy and the views were incredible. Great hiking trails nearby.' },
      { user: jane, listing: listings[1], rating: 5, comment: 'Loved every moment! The fireplace made chilly evenings so comfortable. Highly recommend for nature lovers.' },
      { user: john, listing: listings[2], rating: 4, comment: 'Great location in the heart of Mumbai. Modern and clean. Perfect for a business trip.' },
      { user: jane, listing: listings[3], rating: 5, comment: 'A truly royal experience! The haveli architecture is jaw-dropping. The courtyard dining was magical.' },
      { user: john, listing: listings[4], rating: 4, comment: 'Best budget hostel I have stayed at. Met amazing people and the rooftop yoga was a bonus!' },
      { user: jane, listing: listings[5], rating: 5, comment: 'The eco resort is paradise on earth. Loved the sustainable approach and the Ayurvedic spa.' },
      { user: john, listing: listings[6], rating: 5, comment: 'The houseboat experience was truly unique. The private chef prepared incredible Kerala cuisine.' },
      { user: jane, listing: listings[7], rating: 5, comment: 'Sleeping in a treehouse was a childhood dream come true! The nature sounds were soothing.' },
      { user: john, listing: listings[8], rating: 3, comment: 'Good business hotel with all necessary amenities. A bit impersonal but very efficient.' },
      { user: jane, listing: listings[9], rating: 4, comment: 'The lake views were stunning. Very peaceful and perfect for a weekend escape from the city.' },
      { user: john, listing: listings[10], rating: 5, comment: 'Desert camping was an unforgettable experience. The cultural show and camel ride were highlights!' },
      { user: jane, listing: listings[11], rating: 4, comment: 'Waking up to tea plantations was surreal. The Kanchenjunga sunrise was worth the early wake-up.' },
      { user: john, listing: listings[12], rating: 5, comment: 'The penthouse is out of this world! Smart home features and the jacuzzi terrace were amazing.' },
      { user: jane, listing: listings[13], rating: 4, comment: 'Loved the bamboo cottage and kayaking on the river. The organic meals were delicious.' },
      { user: john, listing: listings[14], rating: 5, comment: 'The infinity pool overlooking the ocean is Instagram-perfect. World-class resort experience.' },
      { user: jane, listing: listings[14], rating: 4, comment: 'Beautiful resort with excellent service. The cliff-top location is spectacular.' },
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

    // Create some bookings
    const bookings = await Booking.create([
      {
        listing: listings[0]._id,
        user: john._id,
        checkIn: new Date('2026-04-10'),
        checkOut: new Date('2026-04-15'),
        guests: 2,
        totalPrice: 5 * listings[0].price,
        status: 'confirmed',
      },
      {
        listing: listings[2]._id,
        user: jane._id,
        checkIn: new Date('2026-04-05'),
        checkOut: new Date('2026-04-08'),
        guests: 1,
        totalPrice: 3 * listings[2].price,
        status: 'confirmed',
      },
      {
        listing: listings[6]._id,
        user: john._id,
        checkIn: new Date('2026-03-20'),
        checkOut: new Date('2026-03-22'),
        guests: 2,
        totalPrice: 2 * listings[6].price,
        status: 'confirmed',
      },
      {
        listing: listings[1]._id,
        user: jane._id,
        checkIn: new Date('2026-03-01'),
        checkOut: new Date('2026-03-04'),
        guests: 3,
        totalPrice: 3 * listings[1].price,
        status: 'cancelled',
      },
    ]);

    console.log(`Created ${bookings.length} bookings...`);
    console.log('\n--- Seed Complete ---');
    console.log('Admin login: admin@tripzybnb.com / admin123');
    console.log('User login:  beepro@user.com / password123');
    console.log('User login:  jane@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
