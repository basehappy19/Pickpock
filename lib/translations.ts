export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      orders: "Orders",
      products: "Products",
      search: "Search items...",
    },
    dashboard: {
      title: "Dashboard Overview",
      subtitle: "Welcome back, Admin. Here's what's happening today.",
      stats: {
        revenue: "Total Revenue",
        users: "Active Users",
        products: "Total Products",
        rating: "Avg. Rating",
      },
      table: {
        title: "Recent Products",
        name: "Product Name",
        category: "Category",
        price: "Price",
        stock: "Stock",
        status: "Status",
        inStock: "In Stock",
        lowStock: "Low Stock",
        noData: "No products found matching your search.",
      },
      filters: {
        search: "Search products...",
        allCategories: "All Categories",
      }
    },
    orders: {
      title: "Order Management",
      subtitle: "Track and manage all your store orders.",
      searchPlaceholder: "Search order ID or customer...",
      totalAmount: "Total Amount",
      customer: "Customer",
      items: "Items",
      qtyPrice: "Qty / Price",
      viewDetails: "View Details",
      status: {
        pending: "Pending",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled"
      }
    },
    products: {
      listTitle: "Products",
      listSubtitle: "Explore our collection of AI-powered premium products.",
      reviews: "reviews",
      warranty: "1 Year Warranty",
      shipping: "Free Shipping",
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      specs: "Product Specifications",
      customerReviews: "Customer Reviews",
      noReviews: "No reviews yet. Be the first!",
      aiInsights: {
        title: "AI Review Insights",
        subtitle: "Summarize opinions with AI",
        placeholder: "Let AI analyze all customer reviews for easier decision making.",
        button: "Analyze Now",
        buttonRetry: "Re-analyze",
        error: "Sorry, AI system is temporary unavailable. Please try again."
      }
    },
    common: {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      export: "Export",
      view: "View",
      showing: "Showing",
      of: "of",
      previous: "Previous",
      next: "Next"
    }
  },
  th: {
    nav: {
      dashboard: "แผงควบคุม",
      orders: "คำสั่งซื้อ",
      products: "สินค้า",
      search: "ค้นหาสินค้า...",
    },
    dashboard: {
      title: "ภาพรวมระบบ",
      subtitle: "ยินดีต้อนรับกลับ, ผู้ดูแลระบบ นี่คือสถานะปัจจุบันของวันนี้",
      stats: {
        revenue: "รายได้รวม",
        users: "ผู้ใช้งาน",
        products: "สินค้าทั้งหมด",
        rating: "คะแนนเฉลี่ย",
      },
      table: {
        title: "รายการสินค้าล่าสุด",
        name: "ชื่อสินค้า",
        category: "หมวดหมู่",
        price: "ราคา",
        stock: "คงเหลือ",
        status: "สถานะ",
        inStock: "มีสินค้า",
        lowStock: "สินค้าใกล้หมด",
        noData: "ไม่พบข้อมูลที่ค้นหา",
      },
      filters: {
        search: "ค้นหาสินค้า...",
        allCategories: "ทุกหมวดหมู่",
      }
    },
    orders: {
      title: "การจัดการคำสั่งซื้อ",
      subtitle: "ติดตามและจัดการคำสั่งซื้อทั้งหมดของร้านคุณ",
      searchPlaceholder: "ค้นหารหัสสั่งซื้อหรือชื่อลูกค้า...",
      totalAmount: "ยอดรวมทั้งหมด",
      customer: "ลูกค้า",
      items: "รายการสินค้า",
      qtyPrice: "จำนวน / ราคา",
      viewDetails: "ดูรายละเอียด",
      status: {
        pending: "รอดำเนินการ",
        processing: "กำลังเตรียมจัดส่ง",
        shipped: "จัดส่งแล้ว",
        delivered: "ได้รับสินค้าแล้ว",
        cancelled: "ยกเลิกแล้ว"
      }
    },
    products: {
      listTitle: "รายการสินค้า",
      listSubtitle: "สำรวจคอลเลกชันสินค้าพรีเมียมที่ขับเคลื่อนด้วย AI ของเรา",
      reviews: "รีวิว",
      warranty: "รับประกัน 1 ปี",
      shipping: "ส่งฟรีทั่วประเทศ",
      addToCart: "เพิ่มลงรถเข็น",
      buyNow: "ซื้อเลย",
      specs: "รายละเอียดทางเทคนิค",
      customerReviews: "รีวิวจากลูกค้า",
      noReviews: "ยังไม่มีรีวิว ร่วมเป็นคนแรกที่รีวิวสินค้านี้!",
      aiInsights: {
        title: "AI Review Insights",
        subtitle: "สรุปความคิดเห็นด้วย AI",
        placeholder: "ให้ AI ช่วยวิเคราะห์รีวิวจากลูกค้าทั้งหมด เพื่อตัดสินใจได้ง่ายขึ้น",
        button: "วิเคราะห์เลย",
        buttonRetry: "ขอความเห็นใหม่",
        error: "ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว ลองใหม่อีกครั้งนะ"
      }
    },
    common: {
      daily: "รายวัน",
      weekly: "รายสัปดาห์",
      monthly: "รายเดือน",
      export: "ส่งออก",
      view: "มุมมอง",
      showing: "กำลังแสดง",
      of: "จากทั้งหมด",
      previous: "ก่อนหน้า",
      next: "ถัดไป"
    }
  }
};

export type Language = 'en' | 'th';
export type TranslationType = typeof translations.en;
