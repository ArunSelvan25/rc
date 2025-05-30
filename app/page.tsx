'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const previewRef = useRef<HTMLDivElement>(null);

  const [template, setTemplate] = useState({
    title: 'Rental Payment Receipt',
    contactName: process.env.NEXT_PUBLIC_CONTACT_NAME || 'John Doe',
    contactNumber: process.env.NEXT_PUBLIC_CONTACT_NUMBER || '1234567890',
    greetingMessage: 'Hello {{name}},',
    body: 'This is a confirmation that your monthly rent amount of {{price}} has been generated for {{rentMonth}}.',
    notes: 'Please ensure the payment is completed by {{dueDate}}. For any assistance, feel free to contact {{contact_name}} at {{contact_number}}.',
    thankyou_notes: 'Thank you!',
  });

  const [customer, setCustomer] = useState({
    name: '',
    number: '',
    price: '',
    rentMonth: '',
    dueDate: ''
  });

  const [extras, setExtras] = useState([{ name: '', price: '', rentMonth: '', dueDate: '' }]);
  const [total, setTotal] = useState(0);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTemplate({ ...template, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleExtraChange = (i: number, field: string, value: string) => {
    const newExtras = [...extras];
    newExtras[i][field as keyof typeof extras[number]] = value;
    setExtras(newExtras);
  };

  const addExtra = () => {
    setExtras([...extras, { name: '', price: '', rentMonth: '', dueDate: '' }]);
  };

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const renderTemplate = (tpl: string, data: { [key: string]: any }) => {
    return tpl
      .replace(/{{\s*name\s*}}/g, data.name || '')
      .replace(/{{\s*number\s*}}/g, data.number || '')
      .replace(/{{\s*rentMonth\s*}}/g, data.rentMonth || '')
      .replace(/{{\s*dueDate\s*}}/g, data.dueDate || '')
      .replace(/{{\s*price\s*}}/g, `₹${parseFloat(data.price || 0).toFixed(2)}`)
      .replace(/{{\s*contact_name\s*}}/g, data.contactName || '')
      .replace(/{{\s*contact_number\s*}}/g, data.contactNumber || '')
      .replace(/{{\s*total\s*}}/g, `₹${total.toFixed(2)}`);
  };

  const handleDownload = () => {
    window.print();
  }
  

  useEffect(() => {
    const main = parseFloat(customer.price) || 0;
    const extraTotal = extras.reduce((sum, e) => sum + parseFloat(e.price?.toString() || '0'), 0);
    setTotal(main + extraTotal);
  }, [customer, extras]);

  const renderExtrasTable = () => {
    const rows = [];

    if (customer.price) {
      rows.push(
        <tr key="rent">
          <td>Rental Price</td>
          <td>₹{parseFloat(customer.price).toFixed(2)}</td>
        </tr>
      );
    }

    extras.forEach((e, i) => {
      if (e.name && e.price) {
        rows.push(
          <tr key={i}>
            <td>{e.name}</td>
            <td>₹{parseFloat(e.price).toFixed(2)}</td>
          </tr>
        );
      }
    });

    return rows.length > 0 ? (
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    ) : null;
  };

  return (
    <div className="container">
    {/* Top Section - Customer Form and Preview */}
    <div className="section">
      {/* Customer Form */}
      <div className="formBox">
        <h2>Customer Details</h2>
        <input
          name="name"
          value={customer.name}
          onChange={handleCustomerChange}
          placeholder="Customer Name"
        />
        <input
          name="number"
          value={customer.number}
          onChange={handleCustomerChange}
          placeholder="Customer Number"
        />
        <input
          name="rentMonth"
          value={customer.rentMonth}
          onChange={handleCustomerChange}
          placeholder="Rent month"
        />
        <input
          name="dueDate"
          value={customer.dueDate}
          onChange={handleCustomerChange}
          placeholder="Due date"
        />
        <input
          name="price"
          value={customer.price}
          onChange={handleCustomerChange}
          type="number"
          placeholder="Rental Price"
        />

        <label><strong>Extras</strong></label>
        <div className="extrasContainer">
          {extras.map((extra, i) => (
            <div key={i} className="extrasItem">
              <input
                placeholder="Extra Name"
                value={extra.name}
                onChange={e => handleExtraChange(i, 'name', e.target.value)}
              />
              <input
                type="number"
                placeholder="Extra Price"
                value={extra.price}
                onChange={e => handleExtraChange(i, 'price', e.target.value)}
              />
              <button onClick={() => removeExtra(i)} className="removeBtn mb-15">×</button>
            </div>
          ))}
          <button onClick={addExtra} className="addExtraBtn">+ Add Extra</button>
        </div>

        <div className="total">Total: ₹ {total.toFixed(2)}</div>
      </div>

      <div className="previewBox" id="previewContent">
        <div>
          {template.title && <p><strong>{template.title}</strong></p>}
          {template.greetingMessage && <p>{renderTemplate(template.greetingMessage, { ...template, ...customer, total })}</p>}
          {template.body && <p>{renderTemplate(template.body, { ...template, ...customer, total })}</p>}
          {customer.name && <p><strong>Tenant/Property:</strong> {customer.name} {customer.number && `(${customer.number})`}</p>}
          {renderExtrasTable()}
          <p className="total">Total: ₹ {total.toFixed(2)}</p>
          {template.notes && <p>{renderTemplate(template.notes, { ...template, ...customer, total })}</p>}

          {template.thankyou_notes && <p>{renderTemplate(template.thankyou_notes, { ...template, ...customer, total })}</p>}
        </div>
        {/* Preview */}
        <div>
          <button className="downloadBtn" onClick={handleDownload}>
            Download PDF
          </button>
        </div>
      </div>
    </div>

    {/* Bottom Section - Template Form and Variables */}
    <div className="section">
      {/* Template Form */}
      <div className="formBox">
        <h2>Template Details</h2>
        {Object.keys(template).map(key =>
          key === 'body' || key.includes('notes') ? (
            <textarea
              key={key}
              name={key}
              value={template[key as keyof typeof template]}
              onChange={handleTemplateChange}
              placeholder={key.replace(/_/g, ' ')}
            />
          ) : (
            <input
              key={key}
              name={key}
              value={template[key as keyof typeof template]}
              onChange={handleTemplateChange}
              placeholder={key.replace(/_/g, ' ')}
            />
          )
        )}
      </div>

      {/* Variable List */}
      <div className="formBox variableBox">
        <h2 className="text-xl font-semibold mb-4">Available Variables</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border-b">Variable</th>
                <th className="px-4 py-2 text-left border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border-b">
                  <code title="Customer name">{'{{name}}'}</code>
                </td>
                <td className="px-4 py-2 border-b">Customer name</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">
                  <code title="Customer number">{'{{number}}'}</code>
                </td>
                <td className="px-4 py-2 border-b">Customer number</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">
                  <code title="Customer number">{'{{dueDate}}'}</code>
                </td>
                <td className="px-4 py-2 border-b">Payment last date</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">
                  <code title="Customer number">{'{{rentMonth}}'}</code>
                </td>
                <td className="px-4 py-2 border-b">Rent for month</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">
                  <code title="Rental price">{'{{price}}'}</code>
                </td>
                <td className="px-4 py-2 border-b">Rental price</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">
                  <code title="Contact name">{'{{contact_name}}'}</code>
                </td>
                <td className="px-4 py-2 border-b">Contact name</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">
                  <code title="Contact number">{'{{contact_number}}'}</code>
                </td>
                <td className="px-4 py-2 border-b">Contact number</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  <code title="Total amount">{'{{total}}'}</code>
                </td>
                <td className="px-4 py-2">Total amount</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </div>
  </div>
  );
}
