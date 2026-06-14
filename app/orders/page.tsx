"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import { cn, formatCurrency, formatDate, getImgSrc } from "@/lib/utils";
import { Package, Truck, Search, User, X, Receipt, MapPin, Phone, Mail, CreditCard, Filter, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useRole } from "@/hooks/use-role";
import AccessRestricted from "@/components/shared/access-restricted";
import Link from "next/link";
import { useState, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function OrdersContent() {
  const { t, language } = useLanguage();
  const { orders, products, updateOrderStatus } = useGlobalData();
  const { role, user } = useRole();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchTerm = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "ALL";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Filter orders based on role, status, and search
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Role-based filtering
      let isRoleMatch = false;
      if (role === "founder") {
        isRoleMatch = true;
      } else if (role === "partner" && user?.store) {
        isRoleMatch = order.items.some(item => {
          const prod = products.find(p => p.id === item.productId);
          return prod && prod.storeId === user.store?.store_id;
        });
      }

      if (!isRoleMatch) return false;

      // 2. Status filtering
      const isStatusMatch = statusFilter === "ALL" || order.status.toUpperCase() === statusFilter;
      
      // 3. Search filtering
      const isSearchMatch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      return isStatusMatch && isSearchMatch;
    });
  }, [orders, products, role, user, statusFilter, searchTerm]);

  if (role === "customer") {
    return <AccessRestricted requiredRole={["founder", "partner"]} currentPage="Orders Management" />;
  }

  // Calculate metrics for filtered results
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCount = filteredOrders.length;

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED': return "bg-emerald-500/10 text-emerald-600";
      case 'SHIPPED': return "bg-blue-500/10 text-blue-600";
      case 'PROCESSING': return "bg-amber-500/10 text-amber-600";
      case 'CANCELLED': return "bg-rose-500/10 text-rose-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-20 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">
             {role === "founder" ? t.orders.title : (user?.store?.name || t.orders.title)}
          </h1>
          <p className="text-slate-500 font-medium">
             {role === "founder" ? t.orders.founderSubtitle : (t.orders.partnerSubtitle?.replace("{storeName}", user?.store?.name || "your store") || `Manage orders for ${user?.store?.name || "your store"}.`)}
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 max-w-2xl">
          <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder={t.orders.filterBySearch}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => updateFilters("q", e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-48 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
            <select 
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-primary outline-none transition-all font-bold uppercase text-xs cursor-pointer appearance-none"
              value={statusFilter}
              onChange={(e) => updateFilters("status", e.target.value)}
            >
              <option value="ALL">{t.orders.allStatuses}</option>
              <option value="PENDING">{t.orders.status.pending}</option>
              <option value="PROCESSING">{t.orders.status.processing}</option>
              <option value="SHIPPED">{t.orders.status.shipped}</option>
              <option value="DELIVERED">{t.orders.status.delivered}</option>
              <option value="CANCELLED">{t.orders.status.cancelled}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5 shadow-sm">
            <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
               <Package className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.orders.totalOrders}</p>
               <h3 className="text-2xl font-bold tracking-tight text-slate-900">{totalCount.toLocaleString()}</h3>
            </div>
         </div>
         <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5 shadow-sm">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
               <CreditCard className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.orders.combinedRevenue}</p>
               <h3 className="text-2xl font-bold tracking-tight text-emerald-600">{formatCurrency(totalRevenue)}</h3>
            </div>
         </div>
         <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5 shadow-sm">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
               <Truck className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.orders.activeFilters}</p>
               <h3 className="text-xl font-bold tracking-tight text-blue-600 uppercase">{statusFilter === "ALL" ? t.orders.allStatuses : ((t.orders.status as any)[statusFilter.toLowerCase()] || statusFilter)}</h3>
            </div>
         </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-20 text-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">{t.orders.noOrdersFound || "No orders found"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Order Row Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-600">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 tracking-tight">{order.id}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{formatDate(order.createdAt, language)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t.orders.totalAmount}</p>
                    <p className="text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <select 
                      className={cn(
                          "text-xs font-bold uppercase tracking-tight bg-white border border-slate-200 rounded-lg px-4 py-2 outline-none cursor-pointer transition-all shadow-sm",
                          order.status.toUpperCase() === "PENDING" ? "text-amber-600" : 
                          order.status.toUpperCase() === "DELIVERED" ? "text-emerald-600" :
                          "text-primary"
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
              
              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.orders.items}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.orders.qtyPrice}</span>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item: any, idx: number) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-slate-50 overflow-hidden border border-slate-100">
                                <img src={getImgSrc(product?.image)} className="w-full h-full object-cover" alt={item.productName} />
                            </div>
                            <div>
                                <Link href={`/product/${item.productId}`} className="font-bold text-sm text-slate-900 hover:text-primary transition-colors">{item.productName || "Product"}</Link>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{(t.categories as Record<string, string>)[product?.category || ""] || product?.category || "Category"}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 text-xs font-bold items-center">
                            <span className="text-slate-400 bg-slate-50 px-2 py-1 rounded">x{item.quantity}</span>
                            <span className="text-slate-900 font-bold">{formatCurrency(item.price || product?.price || 0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Footer Info */}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase border border-slate-200">
                      {order.customerName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{order.customerName}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {t.orders.customer} ID: <span className="text-slate-600">{order.customerId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="w-full sm:w-auto px-10 py-3 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        {t.common.monthly === "รายเดือน" ? "รายละเอียด / ใบเสร็จ" : "Details / Receipt"}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-primary text-white">
                       <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{t.common.monthly === "รายเดือน" ? "รายละเอียดคำสั่งซื้อ" : "Order Details"}</h2>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {selectedOrder.id}</p>
                    </div>
                 </div>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setSelectedOrder(null);
                   }} 
                   className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                   type="button"
                 >
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 {/* Receipt Content */}
                 <div className="bg-white text-slate-900 p-8 rounded-lg border border-slate-200 border-dashed">
                    <div className="flex justify-between items-start mb-10">
                       <div>
                          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">PickPock Mall</h1>
                          <div className="space-y-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                             <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> 123 MSU Innovation Park, Mahasarakham</p>
                             <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> +66 88-888-8888</p>
                             <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> contact@pickpock.com</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 mb-1">{t.common.monthly === "รายเดือน" ? "ใบเสร็จรับเงิน" : "RECEIPT"}</h2>
                          <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">#{selectedOrder.id}</p>
                          <div className="inline-block px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest">
                             {t.common.monthly === "รายเดือน" ? "ชำระเงินแล้ว" : "PAID"}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-100 border-dashed">
                       <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.common.monthly === "รายเดือน" ? "ข้อมูลลูกค้า" : "BILL TO"}</p>
                          <div className="space-y-1">
                             <p className="font-bold text-slate-900 uppercase">{selectedOrder.customerName}</p>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer ID: {selectedOrder.customerId}</p>
                          </div>
                       </div>
                       <div className="space-y-3 text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.common.monthly === "รายเดือน" ? "วันที่สั่งซื้อ" : "DATE"}</p>
                          <p className="font-bold text-slate-900 uppercase">{formatDate(selectedOrder.createdAt, language)}</p>
                       </div>
                    </div>

                    <table className="w-full mb-10">
                       <thead>
                          <tr className="border-b border-slate-100">
                             <th className="py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">{t.dashboard.table.name}</th>
                             <th className="py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{t.dashboard.table.stock}</th>
                             <th className="py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">{t.dashboard.table.price}</th>
                             <th className="py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">{t.common.monthly === "รายเดือน" ? "รวม" : "TOTAL"}</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {selectedOrder.items.map((item: any, i: number) => {
                             const product = products.find(p => p.id === item.productId);
                             const price = item.price || product?.price || 0;
                             return (
                                <tr key={i}>
                                   <td className="py-4">
                                      <p className="font-bold text-sm text-slate-900 uppercase">{item.productName || "Product"}</p>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{(t.categories as Record<string, string>)[product?.category || ""] || product?.category}</p>
                                   </td>
                                   <td className="py-4 text-center font-bold text-slate-900">x{item.quantity}</td>
                                   <td className="py-4 text-right font-bold text-slate-900">{formatCurrency(price)}</td>
                                   <td className="py-4 text-right font-bold text-slate-900">{formatCurrency(price * item.quantity)}</td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>

                    <div className="flex justify-end pt-8 border-t border-slate-200">
                       <div className="w-80 space-y-3">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                             <span>{t.history.subtotal}</span>
                             <span>{formatCurrency(selectedOrder.originalAmount || selectedOrder.totalAmount)}</span>
                          </div>
                          
                          {selectedOrder.discounts?.tier > 0 && (
                            <div className="flex justify-between items-center text-xs font-bold text-emerald-600 uppercase tracking-widest">
                               <span>{t.history.vipDiscount}</span>
                               <span>-{formatCurrency(selectedOrder.discounts.tier)}</span>
                            </div>
                          )}

                          {selectedOrder.discounts?.coupon > 0 && (
                            <div className="flex justify-between items-center text-xs font-bold text-rose-600 uppercase tracking-widest">
                               <span>Coupon ({selectedOrder.discounts.couponCode})</span>
                               <span>-{formatCurrency(selectedOrder.discounts.coupon)}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-4 border-t border-slate-100 border-dashed">
                             <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t.history.netPrice}</span>
                             <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(selectedOrder.totalAmount)}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Thank you for shopping with PickPock Mall!</p>
                       <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">This is a computer-generated receipt.</p>
                    </div>
                 </div>

                 {/* Additional Info Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5" /> {t.common.monthly === "รายเดือน" ? "สถานะการจัดส่ง" : "Delivery Status"}
                       </h4>
                       <div className="inline-flex px-3 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider bg-white border border-slate-200">
                          {(t.orders.status as any)[selectedOrder.status.toLowerCase()] || selectedOrder.status}
                       </div>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5" /> {t.common.monthly === "รายเดือน" ? "วิธีชำระเงิน" : "Payment Method"}
                       </h4>
                       <p className="font-bold text-sm text-slate-900 uppercase">PromptPay / QR Payment</p>
                    </div>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(null);
                  }}
                  className="px-8 py-3 rounded-lg border border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                 >
                    {t.common.close}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center flex flex-col items-center justify-center min-h-[50vh]"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /><p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Orders...</p></div>}>
      <OrdersContent />
    </Suspense>
  );
}
