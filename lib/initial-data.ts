import { Product, Order, Coupon } from "@/types";

export const mockProducts: Product[] = [
  {
    "id": "p-101",
    "name": "Wireless Noise Cancelling Headphones",
    "description": "Wireless Noise Cancelling Headphones - Premium quality product selected by AI.",
    "price": 2500,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Headphones",
    "stock": 50,
    "rating": 4.7,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.799Z",
    "storeName": "MSU Official",
    "isOfficial": true,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-102",
    "name": "Running Shoes Gen 5",
    "description": "Running Shoes Gen 5 - Premium quality product selected by AI.",
    "price": 1800,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Shoes",
    "stock": 10,
    "rating": 5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-103",
    "name": "Smart Watch Series X",
    "description": "Smart Watch Series X - Premium quality product selected by AI.",
    "price": 4500,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Smart+Watch",
    "stock": 25,
    "rating": 4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "MSU Official",
    "isOfficial": true,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-104",
    "name": "Mechanical Keyboard RGB",
    "description": "Mechanical Keyboard RGB - Premium quality product selected by AI.",
    "price": 3200,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Keyboard",
    "stock": 5,
    "rating": 4.6,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-105",
    "name": "Gaming Mouse Wireless",
    "description": "Gaming Mouse Wireless - Premium quality product selected by AI.",
    "price": 1200,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Mouse",
    "stock": 0,
    "rating": 4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-106",
    "name": "4K Monitor 27 inch",
    "description": "4K Monitor 27 inch - Premium quality product selected by AI.",
    "price": 8900,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Monitor",
    "stock": 12,
    "rating": 4.6,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "MSU Official",
    "isOfficial": true,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-107",
    "name": "USB-C Fast Charger",
    "description": "USB-C Fast Charger - Premium quality product selected by AI.",
    "price": 550,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Charger",
    "stock": 100,
    "rating": 4.6,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-108",
    "name": "Bluetooth Speaker Mini",
    "description": "Bluetooth Speaker Mini - Premium quality product selected by AI.",
    "price": 790,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Speaker",
    "stock": 30,
    "rating": 4.6,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-109",
    "name": "Laptop Stand Aluminum",
    "description": "Laptop Stand Aluminum - Premium quality product selected by AI.",
    "price": 450,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Stand",
    "stock": 45,
    "rating": 4.6,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-110",
    "name": "Webcam HD 1080p",
    "description": "Webcam HD 1080p - Premium quality product selected by AI.",
    "price": 1100,
    "category": "Electronics",
    "image": "https://placehold.co/300x300?text=Webcam",
    "stock": 8,
    "rating": 4.3,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-111",
    "name": "Cotton T-Shirt Black",
    "description": "Cotton T-Shirt Black - Premium quality product selected by AI.",
    "price": 250,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=T-Shirt",
    "stock": 60,
    "rating": 4.7,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-112",
    "name": "Denim Jeans Slim Fit",
    "description": "Denim Jeans Slim Fit - Premium quality product selected by AI.",
    "price": 990,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Jeans",
    "stock": 20,
    "rating": 4.6,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-113",
    "name": "Leather Wallet",
    "description": "Leather Wallet - Premium quality product selected by AI.",
    "price": 1500,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Wallet",
    "stock": 15,
    "rating": 4.2,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-114",
    "name": "Aviator Sunglasses",
    "description": "Aviator Sunglasses - Premium quality product selected by AI.",
    "price": 500,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Sunglasses",
    "stock": 35,
    "rating": 4.4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-115",
    "name": "Hoodie Sweatshirt Grey",
    "description": "Hoodie Sweatshirt Grey - Premium quality product selected by AI.",
    "price": 750,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Hoodie",
    "stock": 0,
    "rating": 4.1,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-116",
    "name": "Canvas Backpack",
    "description": "Canvas Backpack - Premium quality product selected by AI.",
    "price": 1200,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Backpack",
    "stock": 18,
    "rating": 4.9,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-117",
    "name": "Sports Cap",
    "description": "Sports Cap - Premium quality product selected by AI.",
    "price": 300,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Cap",
    "stock": 50,
    "rating": 4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-118",
    "name": "Formal Shirt White",
    "description": "Formal Shirt White - Premium quality product selected by AI.",
    "price": 600,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Shirt",
    "stock": 25,
    "rating": 4.8,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-119",
    "name": "Winter Jacket",
    "description": "Winter Jacket - Premium quality product selected by AI.",
    "price": 2200,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Jacket",
    "stock": 5,
    "rating": 4.2,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-120",
    "name": "Ankle Socks (Pack of 3)",
    "description": "Ankle Socks (Pack of 3) - Premium quality product selected by AI.",
    "price": 150,
    "category": "Fashion",
    "image": "https://placehold.co/300x300?text=Socks",
    "stock": 100,
    "rating": 4.4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-121",
    "name": "Modern Desk Lamp",
    "description": "Modern Desk Lamp - Premium quality product selected by AI.",
    "price": 850,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Lamp",
    "stock": 20,
    "rating": 4.8,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-122",
    "name": "Memory Foam Pillow",
    "description": "Memory Foam Pillow - Premium quality product selected by AI.",
    "price": 600,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Pillow",
    "stock": 30,
    "rating": 4.8,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-123",
    "name": "Ceramic Coffee Mug",
    "description": "Ceramic Coffee Mug - Premium quality product selected by AI.",
    "price": 120,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Mug",
    "stock": 80,
    "rating": 4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-124",
    "name": "Bath Towel Set",
    "description": "Bath Towel Set - Premium quality product selected by AI.",
    "price": 450,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Towel",
    "stock": 22,
    "rating": 4.5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-125",
    "name": "Minimalist Wall Clock",
    "description": "Minimalist Wall Clock - Premium quality product selected by AI.",
    "price": 550,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Clock",
    "stock": 14,
    "rating": 4.2,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-126",
    "name": "Plant Pot (Indoor)",
    "description": "Plant Pot (Indoor) - Premium quality product selected by AI.",
    "price": 250,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Pot",
    "stock": 0,
    "rating": 4.4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-127",
    "name": "Essential Oil Diffuser",
    "description": "Essential Oil Diffuser - Premium quality product selected by AI.",
    "price": 990,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Diffuser",
    "stock": 15,
    "rating": 4.2,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-128",
    "name": "Non-Stick Frying Pan",
    "description": "Non-Stick Frying Pan - Premium quality product selected by AI.",
    "price": 750,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Pan",
    "stock": 28,
    "rating": 4.2,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-129",
    "name": "Picture Frame 8x10",
    "description": "Picture Frame 8x10 - Premium quality product selected by AI.",
    "price": 180,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Frame",
    "stock": 60,
    "rating": 4.5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-130",
    "name": "Floor Rug (Grey)",
    "description": "Floor Rug (Grey) - Premium quality product selected by AI.",
    "price": 1200,
    "category": "Home",
    "image": "https://placehold.co/300x300?text=Rug",
    "stock": 8,
    "rating": 4.3,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-131",
    "name": "Yoga Mat",
    "description": "Yoga Mat - Premium quality product selected by AI.",
    "price": 350,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Yoga+Mat",
    "stock": 40,
    "rating": 4.9,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-132",
    "name": "Dumbbell Set (5kg)",
    "description": "Dumbbell Set (5kg) - Premium quality product selected by AI.",
    "price": 900,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Dumbbell",
    "stock": 12,
    "rating": 4.7,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-133",
    "name": "Sports Water Bottle",
    "description": "Sports Water Bottle - Premium quality product selected by AI.",
    "price": 150,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Bottle",
    "stock": 100,
    "rating": 4.3,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-134",
    "name": "Football Size 5",
    "description": "Football Size 5 - Premium quality product selected by AI.",
    "price": 550,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Football",
    "stock": 25,
    "rating": 4.5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-135",
    "name": "Badminton Racket",
    "description": "Badminton Racket - Premium quality product selected by AI.",
    "price": 1200,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Racket",
    "stock": 10,
    "rating": 4.8,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-136",
    "name": "Resistance Bands Set",
    "description": "Resistance Bands Set - Premium quality product selected by AI.",
    "price": 250,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Bands",
    "stock": 55,
    "rating": 4.4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-137",
    "name": "Camping Tent (2 Person)",
    "description": "Camping Tent (2 Person) - Premium quality product selected by AI.",
    "price": 1800,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Tent",
    "stock": 5,
    "rating": 4.9,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-138",
    "name": "Jump Rope",
    "description": "Jump Rope - Premium quality product selected by AI.",
    "price": 120,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Rope",
    "stock": 70,
    "rating": 4.5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-139",
    "name": "Cycling Helmet",
    "description": "Cycling Helmet - Premium quality product selected by AI.",
    "price": 850,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Helmet",
    "stock": 15,
    "rating": 4.2,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-140",
    "name": "Foam Roller",
    "description": "Foam Roller - Premium quality product selected by AI.",
    "price": 300,
    "category": "Sports",
    "image": "https://placehold.co/300x300?text=Roller",
    "stock": 30,
    "rating": 4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-141",
    "name": "Vitamin C Serum",
    "description": "Vitamin C Serum - Premium quality product selected by AI.",
    "price": 590,
    "category": "Beauty",
    "image": "https://placehold.co/300x300?text=Serum",
    "stock": 45,
    "rating": 4.1,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-142",
    "name": "Matte Lipstick Red",
    "description": "Matte Lipstick Red - Premium quality product selected by AI.",
    "price": 290,
    "category": "Beauty",
    "image": "https://placehold.co/300x300?text=Lipstick",
    "stock": 60,
    "rating": 4.5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-143",
    "name": "Moisturizing Cream",
    "description": "Moisturizing Cream - Premium quality product selected by AI.",
    "price": 450,
    "category": "Beauty",
    "image": "https://placehold.co/300x300?text=Cream",
    "stock": 20,
    "rating": 4.9,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-144",
    "name": "Sunscreen SPF 50",
    "description": "Sunscreen SPF 50 - Premium quality product selected by AI.",
    "price": 390,
    "category": "Beauty",
    "image": "https://placehold.co/300x300?text=Sunscreen",
    "stock": 10,
    "rating": 4.5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-145",
    "name": "Perfume 50ml",
    "description": "Perfume 50ml - Premium quality product selected by AI.",
    "price": 2500,
    "category": "Beauty",
    "image": "https://placehold.co/300x300?text=Perfume",
    "stock": 0,
    "rating": 4.5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-146",
    "name": "Face Wash Gentle",
    "description": "Face Wash Gentle - Premium quality product selected by AI.",
    "price": 190,
    "category": "Beauty",
    "image": "https://placehold.co/300x300?text=Face+Wash",
    "stock": 80,
    "rating": 4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-147",
    "name": "Action Figure Hero",
    "description": "Action Figure Hero - Premium quality product selected by AI.",
    "price": 1200,
    "category": "Toys",
    "image": "https://placehold.co/300x300?text=Figure",
    "stock": 12,
    "rating": 4.5,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-148",
    "name": "Board Game Strategy",
    "description": "Board Game Strategy - Premium quality product selected by AI.",
    "price": 1500,
    "category": "Toys",
    "image": "https://placehold.co/300x300?text=Board+Game",
    "stock": 8,
    "rating": 4,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-149",
    "name": "Plush Bear Toy",
    "description": "Plush Bear Toy - Premium quality product selected by AI.",
    "price": 400,
    "category": "Toys",
    "image": "https://placehold.co/300x300?text=Bear",
    "stock": 35,
    "rating": 4.7,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  },
  {
    "id": "p-150",
    "name": "Building Blocks Set",
    "description": "Building Blocks Set - Premium quality product selected by AI.",
    "price": 850,
    "category": "Toys",
    "image": "https://placehold.co/300x300?text=Blocks",
    "stock": 25,
    "rating": 4.8,
    "reviews": [],
    "status": "active",
    "createdAt": "2026-06-13T02:32:35.805Z",
    "storeName": "Partner Store",
    "isOfficial": false,
    "specs": {
      "Origin": "MSU Premium",
      "Material": "Grade A",
      "Warranty": "1 Year"
    }
  }
];

export const mockOrders: Order[] = [
  {
    "id": "ord-001",
    "customerId": "u001",
    "customerName": "Somchai Jaidee",
    "totalAmount": 2500,
    "status": "delivered",
    "createdAt": "2024-11-10T10:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-101",
        "productName": "Wireless Noise Cancelling Headphones",
        "quantity": 1,
        "price": 2500
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-002",
    "customerId": "u002",
    "customerName": "Alice Smith",
    "totalAmount": 2300,
    "status": "shipped",
    "createdAt": "2025-01-15T09:30:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-102",
        "productName": "Running Shoes Gen 5",
        "quantity": 1,
        "price": 1800
      },
      {
        "productId": "p-111",
        "productName": "Cotton T-Shirt Black",
        "quantity": 2,
        "price": 250
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-003",
    "customerId": "u005",
    "customerName": "John Doe",
    "totalAmount": 4500,
    "status": "pending",
    "createdAt": "2026-02-09T14:20:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-103",
        "productName": "Smart Watch Series X",
        "quantity": 1,
        "price": 4500
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-004",
    "customerId": "u003",
    "customerName": "Mana Dee",
    "totalAmount": 750,
    "status": "paid",
    "createdAt": "2026-02-08T11:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-120",
        "productName": "Ankle Socks (Pack of 3)",
        "quantity": 5,
        "price": 150
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-005",
    "customerId": "u008",
    "customerName": "Wipa Rattanaporn",
    "totalAmount": 12100,
    "status": "delivered",
    "createdAt": "2025-12-20T16:45:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-106",
        "productName": "4K Monitor 27 inch",
        "quantity": 1,
        "price": 8900
      },
      {
        "productId": "p-104",
        "productName": "Mechanical Keyboard RGB",
        "quantity": 1,
        "price": 3200
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-006",
    "customerId": "u011",
    "customerName": "David Brown",
    "totalAmount": 2500,
    "status": "cancelled",
    "createdAt": "2025-10-05T08:15:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-145",
        "productName": "Perfume 50ml",
        "quantity": 1,
        "price": 2500
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-007",
    "customerId": "u001",
    "customerName": "Somchai Jaidee",
    "totalAmount": 300,
    "status": "delivered",
    "createdAt": "2025-08-12T13:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-133",
        "productName": "Sports Water Bottle",
        "quantity": 2,
        "price": 150
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-008",
    "customerId": "u004",
    "customerName": "Somsri Jai-ngam",
    "totalAmount": 990,
    "status": "shipped",
    "createdAt": "2026-02-05T10:30:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-112",
        "productName": "Denim Jeans Slim Fit",
        "quantity": 1,
        "price": 990
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-009",
    "customerId": "u015",
    "customerName": "Pimchanok Luea",
    "totalAmount": 480,
    "status": "delivered",
    "createdAt": "2025-09-09T19:20:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-123",
        "productName": "Ceramic Coffee Mug",
        "quantity": 4,
        "price": 120
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-010",
    "customerId": "u002",
    "customerName": "Alice Smith",
    "totalAmount": 980,
    "status": "paid",
    "createdAt": "2026-02-10T09:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-141",
        "productName": "Vitamin C Serum",
        "quantity": 1,
        "price": 590
      },
      {
        "productId": "p-144",
        "productName": "Sunscreen SPF 50",
        "quantity": 1,
        "price": 390
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-011",
    "customerId": "u006",
    "customerName": "Prasit Kung",
    "totalAmount": 1100,
    "status": "delivered",
    "createdAt": "2025-07-25T15:10:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-107",
        "productName": "USB-C Fast Charger",
        "quantity": 2,
        "price": 550
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-012",
    "customerId": "u007",
    "customerName": "Mary Johnson",
    "totalAmount": 1200,
    "status": "pending",
    "createdAt": "2026-02-09T20:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-116",
        "productName": "Canvas Backpack",
        "quantity": 1,
        "price": 1200
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-013",
    "customerId": "u010",
    "customerName": "Nida Patchara",
    "totalAmount": 2150,
    "status": "delivered",
    "createdAt": "2025-06-18T11:45:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-131",
        "productName": "Yoga Mat",
        "quantity": 1,
        "price": 350
      },
      {
        "productId": "p-132",
        "productName": "Dumbbell Set (5kg)",
        "quantity": 2,
        "price": 900
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-014",
    "customerId": "u012",
    "customerName": "Kanda Munkong",
    "totalAmount": 850,
    "status": "shipped",
    "createdAt": "2026-02-06T14:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-150",
        "productName": "Building Blocks Set",
        "quantity": 1,
        "price": 850
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-015",
    "customerId": "u013",
    "customerName": "Sarah Lee",
    "totalAmount": 1200,
    "status": "delivered",
    "createdAt": "2025-05-30T10:20:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-105",
        "productName": "Gaming Mouse Wireless",
        "quantity": 1,
        "price": 1200
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-016",
    "customerId": "u009",
    "customerName": "Kenji Sato",
    "totalAmount": 850,
    "status": "cancelled",
    "createdAt": "2025-11-11T12:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-121",
        "productName": "Modern Desk Lamp",
        "quantity": 1,
        "price": 850
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-017",
    "customerId": "u001",
    "customerName": "Somchai Jaidee",
    "totalAmount": 1740,
    "status": "delivered",
    "createdAt": "2025-04-14T09:15:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-111",
        "productName": "Cotton T-Shirt Black",
        "quantity": 3,
        "price": 250
      },
      {
        "productId": "p-112",
        "productName": "Denim Jeans Slim Fit",
        "quantity": 1,
        "price": 990
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-018",
    "customerId": "u014",
    "customerName": "Arthit Suriya",
    "totalAmount": 990,
    "status": "paid",
    "createdAt": "2026-02-08T16:30:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-127",
        "productName": "Essential Oil Diffuser",
        "quantity": 1,
        "price": 990
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-019",
    "customerId": "u005",
    "customerName": "John Doe",
    "totalAmount": 5000,
    "status": "delivered",
    "createdAt": "2025-03-22T18:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-101",
        "productName": "Wireless Noise Cancelling Headphones",
        "quantity": 2,
        "price": 2500
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-020",
    "customerId": "u003",
    "customerName": "Mana Dee",
    "totalAmount": 480,
    "status": "shipped",
    "createdAt": "2026-02-07T13:45:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-142",
        "productName": "Matte Lipstick Red",
        "quantity": 1,
        "price": 290
      },
      {
        "productId": "p-146",
        "productName": "Face Wash Gentle",
        "quantity": 1,
        "price": 190
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-021",
    "customerId": "u008",
    "customerName": "Wipa Rattanaporn",
    "totalAmount": 1800,
    "status": "delivered",
    "createdAt": "2025-02-15T11:30:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-102",
        "productName": "Running Shoes Gen 5",
        "quantity": 1,
        "price": 1800
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-022",
    "customerId": "u011",
    "customerName": "David Brown",
    "totalAmount": 240,
    "status": "delivered",
    "createdAt": "2025-01-10T14:10:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-138",
        "productName": "Jump Rope",
        "quantity": 2,
        "price": 120
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-023",
    "customerId": "u002",
    "customerName": "Alice Smith",
    "totalAmount": 1500,
    "status": "pending",
    "createdAt": "2026-02-10T08:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-113",
        "productName": "Leather Wallet",
        "quantity": 1,
        "price": 1500
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-024",
    "customerId": "u006",
    "customerName": "Prasit Kung",
    "totalAmount": 550,
    "status": "delivered",
    "createdAt": "2024-12-05T17:20:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-125",
        "productName": "Minimalist Wall Clock",
        "quantity": 1,
        "price": 550
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-025",
    "customerId": "u015",
    "customerName": "Pimchanok Luea",
    "totalAmount": 400,
    "status": "shipped",
    "createdAt": "2026-02-05T09:50:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-149",
        "productName": "Plush Bear Toy",
        "quantity": 1,
        "price": 400
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-026",
    "customerId": "u004",
    "customerName": "Somsri Jai-ngam",
    "totalAmount": 1200,
    "status": "cancelled",
    "createdAt": "2025-09-18T12:15:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-118",
        "productName": "Formal Shirt White",
        "quantity": 2,
        "price": 600
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-027",
    "customerId": "u007",
    "customerName": "Mary Johnson",
    "totalAmount": 550,
    "status": "delivered",
    "createdAt": "2025-08-30T16:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-134",
        "productName": "Football Size 5",
        "quantity": 1,
        "price": 550
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-028",
    "customerId": "u013",
    "customerName": "Sarah Lee",
    "totalAmount": 790,
    "status": "paid",
    "createdAt": "2026-02-09T11:25:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-108",
        "productName": "Bluetooth Speaker Mini",
        "quantity": 1,
        "price": 790
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-029",
    "customerId": "u010",
    "customerName": "Nida Patchara",
    "totalAmount": 2200,
    "status": "delivered",
    "createdAt": "2025-11-25T10:40:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-119",
        "productName": "Winter Jacket",
        "quantity": 1,
        "price": 2200
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-030",
    "customerId": "u001",
    "customerName": "Somchai Jaidee",
    "totalAmount": 900,
    "status": "shipped",
    "createdAt": "2026-02-06T15:30:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-143",
        "productName": "Moisturizing Cream",
        "quantity": 2,
        "price": 450
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-031",
    "customerId": "u012",
    "customerName": "Kanda Munkong",
    "totalAmount": 600,
    "status": "delivered",
    "createdAt": "2025-04-05T13:10:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-122",
        "productName": "Memory Foam Pillow",
        "quantity": 1,
        "price": 600
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-032",
    "customerId": "u009",
    "customerName": "Kenji Sato",
    "totalAmount": 750,
    "status": "delivered",
    "createdAt": "2025-06-22T09:45:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-115",
        "productName": "Hoodie Sweatshirt Grey",
        "quantity": 1,
        "price": 750
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-033",
    "customerId": "u005",
    "customerName": "John Doe",
    "totalAmount": 1800,
    "status": "pending",
    "createdAt": "2026-02-10T10:15:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-137",
        "productName": "Camping Tent (2 Person)",
        "quantity": 1,
        "price": 1800
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-034",
    "customerId": "u014",
    "customerName": "Arthit Suriya",
    "totalAmount": 500,
    "status": "delivered",
    "createdAt": "2025-12-12T14:50:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-114",
        "productName": "Aviator Sunglasses",
        "quantity": 1,
        "price": 500
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-035",
    "customerId": "u003",
    "customerName": "Mana Dee",
    "totalAmount": 1500,
    "status": "shipped",
    "createdAt": "2026-02-04T11:20:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-148",
        "productName": "Board Game Strategy",
        "quantity": 1,
        "price": 1500
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-036",
    "customerId": "u008",
    "customerName": "Wipa Rattanaporn",
    "totalAmount": 540,
    "status": "delivered",
    "createdAt": "2025-03-15T16:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-129",
        "productName": "Picture Frame 8x10",
        "quantity": 3,
        "price": 180
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-037",
    "customerId": "u002",
    "customerName": "Alice Smith",
    "totalAmount": 3200,
    "status": "paid",
    "createdAt": "2026-02-08T12:30:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-104",
        "productName": "Mechanical Keyboard RGB",
        "quantity": 1,
        "price": 3200
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-038",
    "customerId": "u011",
    "customerName": "David Brown",
    "totalAmount": 1200,
    "status": "delivered",
    "createdAt": "2025-07-08T09:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-130",
        "productName": "Floor Rug (Grey)",
        "quantity": 1,
        "price": 1200
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-039",
    "customerId": "u006",
    "customerName": "Prasit Kung",
    "totalAmount": 1200,
    "status": "cancelled",
    "createdAt": "2025-10-30T15:40:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-147",
        "productName": "Action Figure Hero",
        "quantity": 1,
        "price": 1200
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-040",
    "customerId": "u015",
    "customerName": "Pimchanok Luea",
    "totalAmount": 1100,
    "status": "delivered",
    "createdAt": "2025-05-18T10:10:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-110",
        "productName": "Webcam HD 1080p",
        "quantity": 1,
        "price": 1100
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-041",
    "customerId": "u004",
    "customerName": "Somsri Jai-ngam",
    "totalAmount": 900,
    "status": "shipped",
    "createdAt": "2026-02-07T14:25:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-124",
        "productName": "Bath Towel Set",
        "quantity": 2,
        "price": 450
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-042",
    "customerId": "u001",
    "customerName": "Somchai Jaidee",
    "totalAmount": 250,
    "status": "delivered",
    "createdAt": "2025-02-28T11:50:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-136",
        "productName": "Resistance Bands Set",
        "quantity": 1,
        "price": 250
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-043",
    "customerId": "u013",
    "customerName": "Sarah Lee",
    "totalAmount": 450,
    "status": "pending",
    "createdAt": "2026-02-10T11:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-117",
        "productName": "Sports Cap",
        "quantity": 1,
        "price": 300
      },
      {
        "productId": "p-120",
        "productName": "Ankle Socks (Pack of 3)",
        "quantity": 1,
        "price": 150
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-044",
    "customerId": "u007",
    "customerName": "Mary Johnson",
    "totalAmount": 850,
    "status": "delivered",
    "createdAt": "2025-09-05T13:30:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-139",
        "productName": "Cycling Helmet",
        "quantity": 1,
        "price": 850
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-045",
    "customerId": "u010",
    "customerName": "Nida Patchara",
    "totalAmount": 750,
    "status": "paid",
    "createdAt": "2026-02-09T10:05:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-128",
        "productName": "Non-Stick Frying Pan",
        "quantity": 1,
        "price": 750
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-046",
    "customerId": "u012",
    "customerName": "Kanda Munkong",
    "totalAmount": 2400,
    "status": "delivered",
    "createdAt": "2025-06-12T16:15:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-135",
        "productName": "Badminton Racket",
        "quantity": 2,
        "price": 1200
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-047",
    "customerId": "u005",
    "customerName": "John Doe",
    "totalAmount": 300,
    "status": "shipped",
    "createdAt": "2026-02-05T08:45:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-140",
        "productName": "Foam Roller",
        "quantity": 1,
        "price": 300
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-048",
    "customerId": "u014",
    "customerName": "Arthit Suriya",
    "totalAmount": 450,
    "status": "delivered",
    "createdAt": "2025-11-02T12:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-109",
        "productName": "Laptop Stand Aluminum",
        "quantity": 1,
        "price": 450
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-049",
    "customerId": "u009",
    "customerName": "Kenji Sato",
    "totalAmount": 500,
    "status": "cancelled",
    "createdAt": "2025-04-20T14:40:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-126",
        "productName": "Plant Pot (Indoor)",
        "quantity": 2,
        "price": 250
      }
    ],
    "reviewedItems": []
  },
  {
    "id": "ord-050",
    "customerId": "u002",
    "customerName": "Alice Smith",
    "totalAmount": 270,
    "status": "pending",
    "createdAt": "2026-02-10T12:00:00Z",
    "paymentStatus": "paid",
    "items": [
      {
        "productId": "p-133",
        "productName": "Sports Water Bottle",
        "quantity": 1,
        "price": 150
      },
      {
        "productId": "p-138",
        "productName": "Jump Rope",
        "quantity": 1,
        "price": 120
      }
    ],
    "reviewedItems": []
  }
];

export const mockCoupons: Coupon[] = [
  {
    "code": "FOUNDER10",
    "discount": 10,
    "type": "percent",
    "description": "10% Off for Founders"
  },
  {
    "code": "MSU500",
    "discount": 500,
    "type": "fixed",
    "description": "฿500 Off MSU Special"
  }
];
