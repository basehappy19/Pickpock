import { dataService } from "@/services/data-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Truck, CheckCircle2, Clock, Search } from "lucide-react";

export default async function OrdersPage() {
  const orders = await dataService.getOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">ติดตามและจัดการคำสั่งซื้อทั้งหมดของร้านคุณ</p>
        </div>
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search order ID or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-card rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="p-6 border-b bg-muted/30 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-background border shadow-sm">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{order.id}</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Amount</p>
                  <p className="text-xl font-black text-primary">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div className="px-4 py-2 rounded-full border bg-background flex items-center gap-2 font-bold text-sm">
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-sm font-bold text-muted-foreground uppercase">Items</span>
                  <span className="text-sm font-bold text-muted-foreground uppercase">Qty / Price</span>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="font-semibold">{item.productName}</div>
                    <div className="flex gap-4 text-sm font-bold">
                      <span className="text-muted-foreground">x{item.quantity}</span>
                      <span className="text-primary">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-between items-center pt-6 border-t">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {order.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">Customer ID: {order.customerId}</p>
                  </div>
                </div>
                <button className="px-6 py-2 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/80 transition-all">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
