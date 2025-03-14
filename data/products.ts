// Mock data for the Bazaar e-commerce app

export interface Product {
    id: number
    name: string
    price: number
    description: string
    image: string
    category: string
    rating: number
    reviews: number
    seller: string
    location: string
    featured?: boolean
}

export interface Category {
    id: number
    name: string
    image: string
}

export const categories: Category[] = [
    {
        id: 1,
        name: "Clothing",
        image:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
    {
        id: 2,
        name: "Watches",
        image:
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
    {
        id: 3,
        name: "Bags",
        image:
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
    {
        id: 4,
        name: "Electronics",
        image:
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
    {
        id: 5,
        name: "Jewelry",
        image:
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
    {
        id: 6,
        name: "Home Decor",
        image:
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    },
]

export const products: Product[] = [
    {
        id: 1,
        name: "Premium Cotton T-Shirt",
        price: 29.99,
        description:
            "This premium cotton t-shirt is made from 100% organic cotton, providing exceptional comfort and durability. The breathable fabric makes it perfect for everyday wear, while the classic design ensures it pairs well with any outfit. Available in multiple colors and sizes, this t-shirt is a versatile addition to any wardrobe.",
        image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "clothing",
        rating: 4.5,
        reviews: 128,
        seller: "EcoFashion",
        location: "Portland, OR",
        featured: true,
    },
    {
        id: 2,
        name: "Vintage Leather Watch",
        price: 89.99,
        description:
            "This vintage-inspired leather watch combines classic design with modern functionality. The genuine leather strap ages beautifully with wear, while the stainless steel case houses a precise Japanese quartz movement. Water-resistant up to 30 meters, this timepiece is suitable for everyday use and adds a touch of sophistication to any outfit.",
        image:
            "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "watches",
        rating: 4.8,
        reviews: 95,
        seller: "TimePiece Collective",
        location: "Brooklyn, NY",
        featured: true,
    },
    {
        id: 3,
        name: "Canvas Tote Bag",
        price: 39.99,
        description:
            "This durable canvas tote bag is perfect for shopping, beach trips, or as an everyday carry-all. Made from heavy-duty cotton canvas with reinforced stitching at stress points, it's designed to last for years. The spacious interior easily fits all your essentials, while the comfortable shoulder straps make it easy to carry even when fully loaded.",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "bags",
        rating: 4.3,
        reviews: 67,
        seller: "Urban Carriers",
        location: "Austin, TX",
    },
    {
        id: 4,
        name: "Wireless Earbuds",
        price: 79.99,
        description:
            "Experience crystal-clear sound with these premium wireless earbuds. Featuring Bluetooth 5.0 technology for stable connectivity and a battery life of up to 8 hours on a single charge, with an additional 24 hours from the charging case. The ergonomic design ensures a comfortable fit for extended listening sessions, while the touch controls make it easy to manage your music and calls.",
        image:
            "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "electronics",
        rating: 4.6,
        reviews: 203,
        seller: "SoundWave Tech",
        location: "San Francisco, CA",
        featured: true,
    },
    {
        id: 5,
        name: "Handcrafted Silver Necklace",
        price: 59.99,
        description:
            "This elegant handcrafted silver necklace is made by skilled artisans using traditional techniques. The delicate pendant features intricate detailing and hangs from a fine sterling silver chain. Perfect for everyday wear or special occasions, this timeless piece adds a touch of sophistication to any outfit and makes a thoughtful gift for someone special.",
        image:
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "jewelry",
        rating: 4.9,
        reviews: 42,
        seller: "Silver & Stone",
        location: "Santa Fe, NM",
    },
    {
        id: 6,
        name: "Ceramic Plant Pot",
        price: 24.99,
        description:
            "Add a touch of elegance to your indoor garden with this handmade ceramic plant pot. Each pot is individually crafted and glazed, making every piece unique. The drainage hole and accompanying saucer ensure proper plant care, while the minimalist design complements any home decor style. Available in various sizes to accommodate different plants.",
        image:
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "home decor",
        rating: 4.4,
        reviews: 56,
        seller: "Pottery Studio",
        location: "Seattle, WA",
    },
    {
        id: 7,
        name: "Denim Jacket",
        price: 69.99,
        description:
            "This classic denim jacket is a versatile wardrobe staple that never goes out of style. Made from premium quality denim with a comfortable fit, it features traditional button closures and multiple pockets. Perfect for layering in any season, this jacket pairs well with everything from casual tees to dresses, making it an essential piece for any fashion-conscious individual.",
        image:
            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "clothing",
        rating: 4.7,
        reviews: 89,
        seller: "Denim Republic",
        location: "Los Angeles, CA",
        featured: true,
    },
    {
        id: 8,
        name: "Smart Fitness Tracker",
        price: 49.99,
        description:
            "Monitor your health and fitness goals with this advanced smart fitness tracker. Track your steps, heart rate, sleep quality, and calories burned throughout the day. The water-resistant design allows for use during workouts and in various weather conditions. Sync with the companion app to view detailed analytics and set personalized fitness goals for continuous improvement.",
        image:
            "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "electronics",
        rating: 4.2,
        reviews: 175,
        seller: "FitTech",
        location: "Denver, CO",
    },
    {
        id: 9,
        name: "Leather Crossbody Bag",
        price: 119.99,
        description:
            "This stylish leather crossbody bag combines functionality with elegant design. Crafted from genuine full-grain leather that develops a beautiful patina over time, it features multiple compartments to keep your essentials organized. The adjustable strap allows for comfortable wear, while the secure closure keeps your belongings safe. Perfect for both casual outings and more formal occasions.",
        image:
            "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "bags",
        rating: 4.8,
        reviews: 63,
        seller: "Leather Artisans",
        location: "Chicago, IL",
    },
    {
        id: 10,
        name: "Minimalist Wall Clock",
        price: 34.99,
        description:
            "Add a touch of modern elegance to your home with this minimalist wall clock. The clean, simple design features a wooden frame with contrasting hands that make it easy to read the time from across the room. Silent quartz movement ensures quiet operation, making it suitable for bedrooms, living rooms, or offices. Requires one AA battery (not included).",
        image:
            "https://images.unsplash.com/photo-1507646227500-4d389b0012be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        category: "home decor",
        rating: 4.5,
        reviews: 48,
        seller: "Modern Home",
        location: "Minneapolis, MN",
    },
]

// Extract featured products
export const featuredProducts = products.filter((product) => product.featured)

