import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">VendorBridge</h1>
          <p className="text-slate-500 mt-2">Procurement & Vendor Management ERP</p>
        </div>
        {children}
      </div>
    </div>
  );
}
