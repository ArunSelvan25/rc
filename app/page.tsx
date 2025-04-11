'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

export default function Home() {
  const [template, setTemplate] = useState({
    contactName: 'John Doe',
    contactNumber: '9876543210',
    greetingMessage: 'Dear {{name}},',
    body: 'Thanks for choosing us! Your rent is {{price}}.',
    notes: 'Pay before due date. Contact {{contact_name}} ({{contact_number}}) for queries.',
    thankyou_notes: 'Thank you for your business, {{name}}!',
  });

  const [customer, setCustomer] = useState({
    name: '',
    number: '',
    price: '',
  });

  const [extras, setExtras] = useState([{ name: '', price: '' }]);
  const [total, setTotal] = useState(0);

  const handleTemplateChange = (e) => {
    setTemplate({ ...template, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleExtraChange = (i, field, value) => {
    const newExtras = [...extras];
    newExtras[i][field] = value;
    setExtras(newExtras);
  };

  const addExtra = () => {
    setExtras([...extras, { name: '', price: '' }]);
  };

  const removeExtra = (index) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const renderTemplate = (tpl, data) => {
    return tpl
      .replace(/{{\s*name\s*}}/g, data.name || '')
      .replace(/{{\s*number\s*}}/g, data.number || '')
      .replace(/{{\s*price\s*}}/g, `₹${parseFloat(data.price || 0).toFixed(2)}`)
      .replace(/{{\s*contact_name\s*}}/g, data.contactName || '')
      .replace(/{{\s*contact_number\s*}}/g, data.contactNumber || '')
      .replace(/{{\s*total\s*}}/g, `₹${total.toFixed(2)}`);
  };

  useEffect(() => {
    const main = parseFloat(customer.price) || 0;
    const extraTotal = extras.reduce((sum, e) => sum + parseFloat(e.price || 0), 0);
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
    <div className={styles.container}>
      {/* Template Form */}
      <div className={styles.formBox}>
        <h2>Template Details</h2>
        {Object.keys(template).map(key => (
          key === 'body' || key.includes('notes') ? (
            <textarea key={key} name={key} value={template[key]} onChange={handleTemplateChange} placeholder={key.replace(/_/g, ' ')} />
          ) : (
            <input key={key} name={key} value={template[key]} onChange={handleTemplateChange} placeholder={key.replace(/_/g, ' ')} />
          )
        ))}
      </div>

      {/* Customer Form */}
      <div className={styles.formBox}>
        <h2>Customer Details</h2>
        <input name="name" value={customer.name} onChange={handleCustomerChange} placeholder="Customer Name" />
        <input name="number" value={customer.number} onChange={handleCustomerChange} placeholder="Customer Number" />
        <input name="price" value={customer.price} onChange={handleCustomerChange} type="number" placeholder="Rental Price" />

        <label><strong>Extras</strong></label>
        <div className={styles.extrasContainer}>
          {extras.map((extra, i) => (
            <div key={i} className={styles.extrasItem}>
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
              <button onClick={() => removeExtra(i)} className={styles.removeBtn}>×</button>
            </div>
          ))}
          <button onClick={addExtra} className={styles.addExtraBtn}>+ Add Extra</button>
        </div>

        <div className={styles.total}>Total: ₹ {total.toFixed(2)}</div>
        <button className={styles.submitBtn} onClick={(e) => e.preventDefault()}>Submit</button>
      </div>

      {/* Preview */}
      <div className={styles.previewBox}>
        <div>
          {template.greetingMessage && <p>{renderTemplate(template.greetingMessage, { ...template, ...customer, total })}</p>}
          {template.body && <p>{renderTemplate(template.body, { ...template, ...customer, total })}</p>}
          <p><strong>Name:</strong> {customer.name} ({customer.number})</p>
          <p><strong>Contact:</strong> {template.contactName} ({template.contactNumber})</p>
          {renderExtrasTable()}
          <p className={styles.total}>Total: ₹ {total.toFixed(2)}</p>
          {template.notes && <p>{renderTemplate(template.notes, { ...template, ...customer, total })}</p>}
          {template.thankyou_notes && <p>{renderTemplate(template.thankyou_notes, { ...template, ...customer, total })}</p>}
        </div>
      </div>
    </div>
  );
}
