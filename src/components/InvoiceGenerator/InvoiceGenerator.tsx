import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import {
    Save,
    Share2,
    Download,
    Printer,
    Plus,
    Trash2,
    X,
    FileText,
} from "lucide-react";

type InvoiceItem = {
    description: string;
    quantity: number;
    price: number;
    discount?: number;
};

type Seller = { name: string; phone: string; gst: string };
type Buyer = { name: string; phone: string };
type InvoiceMeta = { number: string; date: string; dueDate: string };

type InvoiceGeneratorProps = { onClose?: () => void };

// 🔹 Reusable InputField
const InputField = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}: {
    label: string;
    type?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}) => (
    <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
        />
    </div>
);

export default function InvoiceGenerator({ onClose }: InvoiceGeneratorProps) {
    const [seller, setSeller] = useState<Seller>({ name: "", phone: "", gst: "" });
    const [buyer, setBuyer] = useState<Buyer>({ name: "", phone: "" });
    const [meta, setMeta] = useState<InvoiceMeta>({
        number: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
    });
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: "", quantity: 1, price: 0, discount: 0 },
    ]);
    const [gstRate, setGstRate] = useState<number>(18);
    const [shipping, setShipping] = useState<number>(0);

    // Ref for auto-scroll
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const addItem = () =>
        setItems([...items, { description: "", quantity: 1, price: 0, discount: 0 }]);

    const removeItem = (index: number) =>
        setItems(items.filter((_, i) => i !== index));

    const updateItem = <K extends keyof InvoiceItem>(
        index: number,
        field: K,
        value: InvoiceItem[K]
    ) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    // Scroll to bottom when items change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [items]);

    const subtotal = items.reduce((acc, i) => {
        const lineTotal = i.quantity * i.price;
        const discountAmt = (lineTotal * (i.discount || 0)) / 100;
        return acc + (lineTotal - discountAmt);
    }, 0);

    const gst = subtotal * (gstRate / 100);
    const total = subtotal + gst + shipping;

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Invoice", 10, 10);
        doc.text(`Invoice #: ${meta.number}`, 10, 20);
        doc.text(`Date: ${meta.date}`, 10, 30);
        doc.text(`Due Date: ${meta.dueDate}`, 10, 40);
        doc.text(`Seller: ${seller.name}`, 10, 50);
        doc.text(`Buyer: ${buyer.name}`, 10, 60);
        doc.text(`Total: ₹${total.toFixed(2)}`, 10, 70);
        doc.save("invoice.pdf");
    };

    return (
        <div className="bg-white w-full max-h-[80vh] p-6 overflow-y-auto rounded-2xl shadow-2xl flex flex-col space-y-6 border">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                    <FileText size={20} /> Invoice Creation
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Invoice Meta */}
            <section className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Invoice Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InputField label="Invoice #" value={meta.number} onChange={(e) => setMeta({ ...meta, number: e.target.value })} />
                    <InputField label="Date" type="date" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
                    <InputField label="Due Date" type="date" value={meta.dueDate} onChange={(e) => setMeta({ ...meta, dueDate: e.target.value })} />
                </div>
            </section>

            {/* Seller Info */}
            <section className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Seller Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InputField label="Business Name" value={seller.name} onChange={(e) => setSeller({ ...seller, name: e.target.value })} />
                    <InputField label="Phone" value={seller.phone} onChange={(e) => setSeller({ ...seller, phone: e.target.value })} />
                    <InputField label="GST Number" value={seller.gst} onChange={(e) => setSeller({ ...seller, gst: e.target.value })} />
                </div>
            </section>

            {/* Buyer Info */}
            <section className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Customer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField label="Customer Name" value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} />
                    <InputField label="Customer Phone" value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} />
                </div>
            </section>

            {/* Invoice Items */}
            <section className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Invoice Items</h3>

                <div className="overflow-y-auto max-h-64 border rounded-md bg-white">
                    {/* Table Header */}
                    <div className="grid grid-cols-5 gap-3 text-xs font-semibold text-gray-600 border-b bg-gray-100 sticky top-0 z-10 px-3 py-2">
                        <div>Description</div>
                        <div className="text-center">Qty</div>
                        <div className="text-center">Price</div>
                        <div className="text-center">Discount (%)</div>
                        <div className="text-center">Action</div>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-200">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className={`grid grid-cols-5 gap-3 items-center px-3 py-2 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} rounded-md hover:bg-indigo-50 transition`}
                            >
                                <InputField
                                    label=""
                                    value={item.description}
                                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                                    placeholder="Item description"
                                    type="text"
                                />
                                <InputField
                                    label=""
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                                    placeholder="0"
                                />
                                <InputField
                                    label=""
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                                    placeholder="0.00"
                                />
                                <InputField
                                    label=""
                                    type="number"
                                    value={item.discount || 0}
                                    onChange={(e) => updateItem(idx, "discount", Number(e.target.value))}
                                    placeholder="0"
                                />
                                <button
                                    onClick={() => removeItem(idx)}
                                    title="Remove Item"
                                    className="flex items-center justify-center w-8 h-8 bg-violet-500 text-white rounded-full hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-800 transition-shadow shadow-sm mx-auto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {/* Scroll target for auto scroll */}
                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* Add Item Button */}
                <div className="flex justify-end mt-3">
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 bg-violet-500 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-violet-600 transition"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                </div>
            </section>



            {/* Totals */}
            <section className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <div className="flex flex-col space-y-1 text-sm">
                    <p>Subtotal: <span className="font-semibold">₹{subtotal.toFixed(2)}</span></p>
                    <div className="grid grid-cols-2 gap-3">
                        <InputField label="GST Rate (%)" type="number" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} />
                        <InputField label="Shipping" type="number" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} />
                    </div>
                    <p>GST ({gstRate}%): <span className="font-semibold">₹{gst.toFixed(2)}</span></p>
                    <h3 className="font-bold text-indigo-700 text-lg">Total: ₹{total.toFixed(2)}</h3>
                </div>
            </section>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4 border-t pt-4">
                {[
                    { icon: <Save size={16} />, label: "Save", onClick: () => { } },
                    { icon: <Share2 size={16} />, label: "Share", onClick: () => { } },
                    { icon: <Download size={16} />, label: "Download PDF", onClick: downloadPDF },
                    { icon: <Printer size={16} />, label: "Print", onClick: () => window.print() },
                ].map((btn, idx) => (
                    <button
                        key={idx}
                        onClick={btn.onClick}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-700 transition-shadow shadow-sm"
                    >
                        {btn.icon} {btn.label}
                    </button>
                ))}
            </div>

        </div>
    );
}
