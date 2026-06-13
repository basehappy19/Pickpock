"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import { cn, formatCurrency, formatDate, getImgSrc } from "@/lib/utils";
import { Package, Truck, CheckCircle2, Clock, Search, ShieldCheck, User, Eye, X, Printer, Download, MapPin, Phone, Mail, Receipt, CreditCard } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useRole } from "@/hooks/use-role";
import AccessRestricted from "@/components/shared/access-restricted";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function OrdersPage() {
  const { t } = useLanguage();
  const { orders, products, updateOrderStatus } = useGlobalData();
  const { role, user } = useRole();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject html2pdf script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (role === "customer") {
    return <AccessRestricted requiredRole={["founder", "partner"]} currentPage="Orders Management" />;
  }

  // Filter orders based on items belonging to the seller or all for founder
  const filteredOrders = orders.filter(order => {
    if (role === "founder") return true;
    
    // For Partner (Store Owner), show orders that contain products from their store
    if (role === "partner" && user?.store) {
      return order.items.some(item => {
        const prod = products.find(p => p.id === item.productId);
        return prod && prod.storeId === user.store?.store_id;
      });
    }

    return false;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED': return "bg-emerald-500/10 text-emerald-600";
      case 'SHIPPED': return "bg-blue-500/10 text-blue-600";
      case 'PROCESSING': return "bg-amber-500/10 text-amber-600";
      case 'CANCELLED': return "bg-rose-500/10 text-rose-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handlePrint = async (order: any) => {
    if (!order) return;
    const printContent = printRef.current;
    if (!printContent) return;

    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    const opt = {
      margin:       [10, 10],
      filename:     `Pickpock-Receipt-${order.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Style cleanup for PDF
    const element = printContent.cloneNode(true) as HTMLElement;
    element.style.width = '100%';
    element.style.padding = '20px';
    element.style.color = 'black';
    element.style.backgroundColor = 'white';
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-20 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">
             {role === "founder" ? t.orders.title : (user?.store?.name || t.orders.title)}
          </h1>
          <p className="text-muted-foreground font-bold">
             {role === "founder" ? "Monitor every transaction across the platform." : `Manage orders for ${user?.store?.name || "your store"}.`}
          </p>
        </div>
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text" 
            placeholder={t.orders.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-card focus:border-primary outline-none transition-all font-bold"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-20 text-center rounded-[3rem] border-4 border-dashed bg-muted/20">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-black text-xl uppercase tracking-widest">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-card border-2 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all border-primary/5">
              <div className="p-8 border-b bg-muted/30 flex flex-wrap justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-[1.5rem] bg-background border-2 border-primary/10 shadow-lg shadow-primary/5 text-primary">
                    <Package className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight">{order.id}</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">{formatDate(order.date || order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-70">{t.orders.totalAmount}</p>
                    <p className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                        className={cn(
                            "text-[10px] font-black uppercase tracking-tight bg-background border-2 rounded-xl px-4 py-2.5 outline-none cursor-pointer transition-all shadow-sm",
                            order.status.toUpperCase() === "PENDING" ? "border-amber-500/20 text-amber-600 focus:border-amber-500" : 
                            order.status.toUpperCase() === "DELIVERED" ? "border-emerald-500/20 text-emerald-600 focus:border-emerald-500" :
                            "border-primary/20 text-primary focus:border-primary"
                        )}
                        value={order.status.toUpperCase()}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                        <option value="PENDING">{t.orders.status.pending}</option>
                        <option value="PROCESSING">{t.orders.status.processing}</option>
                        <option value="SHIPPED">{t.orders.status.shipped}</option>
                        <option value="DELIVERED">{t.orders.status.delivered}</option>
                        <option value="CANCELLED">{t.orders.status.cancelled}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-muted">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.orders.items}</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.orders.qtyPrice}</span>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item: any, idx: number) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all shadow-sm">
                                <img src={getImgSrc(product?.image)} className="w-full h-full object-cover" alt={item.productName} />
                            </div>
                            <div>
                                <Link href={`/products/${item.productId}`} className="font-black text-sm lg:text-base hover:text-primary transition-colors">{item.productName || "Product"}</Link>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{product?.category || "Category"}</p>
                            </div>
                          </div>
                          <div className="flex gap-6 text-sm font-black items-center">
                            <span className="text-muted-foreground bg-muted px-2 py-1 rounded-lg">x{item.quantity}</span>
                            <span className="text-primary text-base tracking-tighter">{formatCurrency(item.price || product?.price || 0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t-2 border-dashed border-muted">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary uppercase border-2 border-primary/20 shadow-inner">
                      {order.customerName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-base font-black text-foreground uppercase tracking-tight leading-none mb-1">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">
                        {t.orders.customer} ID: <span className="text-primary">{order.customerId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-muted text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted/80 transition-all cursor-pointer border-2 border-transparent hover:border-primary/10 shadow-sm flex items-center justify-center gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        {t.orders.viewDetails}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setTimeout(() => handlePrint(order), 100);
                      }}
                      className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        {t.common.monthly === "รายเดือน" ? "พิมพ์ใบเสร็จ" : "Print Receipt"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-[3rem] border-2 border-primary/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="p-8 border-b bg-muted/30 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary text-white">
                       <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black tracking-tighter uppercase">{t.common.monthly === "รายเดือน" ? "รายละเอียดคำสั่งซื้อ" : "Order Details"}</h2>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">ID: {selectedOrder.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-rose-500 hover:text-white rounded-2xl transition-all cursor-pointer">
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 {/* Receipt Content for Printing */}
                 <div ref={printRef} className="bg-white text-black p-8 rounded-3xl border-2 border-dashed border-muted print:border-none print:shadow-none print:p-0">
                    <div className="flex justify-between items-start mb-8">
                       <div>
                          <h1 className="text-3xl font-black tracking-tighter text-primary mb-2">PICKPOCK MALL</h1>
                          <div className="space-y-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                             <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> 123 MSU Innovation Park, Mahasarakham</p>
                             <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> +66 88-888-8888</p>
                             <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> contact@pickpock.com</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <h2 className="text-xl font-black uppercase tracking-widest mb-1">{t.common.monthly === "รายเดือน" ? "ใบเสร็จรับเงิน" : "RECEIPT"}</h2>
                          <p className="text-xs font-bold text-muted-foreground mb-4">#{selectedOrder.id}</p>
                          <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest">
                             {t.common.monthly === "รายเดือน" ? "ชำระเงินแล้ว" : "PAID"}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b-2 border-dashed border-muted/30">
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.common.monthly === "รายเดือน" ? "ข้อมูลลูกค้า" : "BILL TO"}</p>
                          <div className="space-y-1">
                             <p className="font-black uppercase">{selectedOrder.customerName}</p>
                             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer ID: {selectedOrder.customerId}</p>
                          </div>
                       </div>
                       <div className="space-y-3 text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.common.monthly === "รายเดือน" ? "วันที่สั่งซื้อ" : "DATE"}</p>
                          <p className="font-black uppercase">{formatDate(selectedOrder.date || selectedOrder.createdAt)}</p>
                       </div>
                    </div>

                    <table className="w-full mb-10">
                       <thead>
                          <tr className="border-b-2 border-black/5">
                             <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.name}</th>
                             <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.stock}</th>
                             <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.price}</th>
                             <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.common.monthly === "รายเดือน" ? "รวม" : "TOTAL"}</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-black/5">
                          {selectedOrder.items.map((item: any, i: number) => {
                             const product = products.find(p => p.id === item.productId);
                             const price = item.price || product?.price || 0;
                             return (
                                <tr key={i}>
                                   <td className="py-4">
                                      <p className="font-black text-sm uppercase">{item.productName || "Product"}</p>
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{product?.category}</p>
                                   </td>
                                   <td className="py-4 text-center font-black">x{item.quantity}</td>
                                   <td className="py-4 text-right font-black">{formatCurrency(price)}</td>
                                   <td className="py-4 text-right font-black text-primary">{formatCurrency(price * item.quantity)}</td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>

                    <div className="flex justify-end border-t-4 border-double border-black/5 pt-8">
                       <div className="w-64 space-y-4">
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                             <span>{t.common.monthly === "รายเดือน" ? "ราคารวม" : "SUBTOTAL"}</span>
                             <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                             <span>{t.common.monthly === "รายเดือน" ? "ส่วนลด" : "DISCOUNT"}</span>
                             <span>{formatCurrency(0)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-muted/30">
                             <span className="text-sm font-black uppercase tracking-tighter">{t.common.monthly === "รายเดือน" ? "ยอดสุทธิ" : "GRAND TOTAL"}</span>
                             <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(selectedOrder.totalAmount)}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-20 pt-10 border-t border-muted/20 text-center">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Thank you for shopping with Pickpock Mall!</p>
                       <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">This is a computer-generated receipt.</p>
                    </div>
                 </div>

                 {/* Order Management Actions (Not printed) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
                    <div className="p-6 rounded-[2rem] bg-muted/50 border-2 border-primary/5 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Truck className="h-3 w-3" /> {t.common.monthly === "รายเดือน" ? "สถานะการจัดส่ง" : "Delivery Status"}
                       </h4>
                       <div className="flex items-center gap-4">
                          <div className={cn("px-4 py-2 rounded-xl font-black text-xs uppercase tracking-tight", getStatusColor(selectedOrder.status))}>
                             {selectedOrder.status}
                          </div>
                       </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-muted/50 border-2 border-primary/5 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <CreditCard className="h-3 w-3" /> {t.common.monthly === "รายเดือน" ? "วิธีชำระเงิน" : "Payment Method"}
                       </h4>
                       <p className="font-black text-sm uppercase">PromptPay / QR Payment</p>
                    </div>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t bg-muted/30 flex justify-end gap-4 no-print">
                 <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-3 rounded-2xl border-2 border-muted-foreground/10 font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all cursor-pointer"
                 >
                    {t.common.close}
                 </button>
                 <button 
                  onClick={() => handlePrint(selectedOrder)}
                  className="px-8 py-3 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 transition-all cursor-pointer flex items-center gap-2"
                 >
                    <Printer className="h-4 w-4" />
                    {t.common.monthly === "รายเดือน" ? "พิมพ์ใบเสร็จ" : "Print Receipt"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
