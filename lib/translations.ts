export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
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
    common: {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
    }
  },
  th: {
    nav: {
      dashboard: "แผงควบคุม",
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
    common: {
      daily: "รายวัน",
      weekly: "รายสัปดาห์",
      monthly: "รายเดือน",
    }
  }
};

export type Language = 'en' | 'th';
export type TranslationType = typeof translations.en;
