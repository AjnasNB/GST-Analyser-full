import { useState } from "react";
import PropTypes from 'prop-types';
import { jsPDF } from "jspdf";
import styles from "./Report.module.css";

const Report = ({ text }) => {
  const [responseText, setResponseText] = useState("");
  const [formattedText, setFormattedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const prompt = ` Analyze the following text: ${text} and create a detailed GST analysis report. The report should include the following sections:
    
    General Information
    - Acknowledgement Number
    - Date of filing
    - PAN
    - Name
    - Address
  
    Income Details
    - Total Income
  
    Tax Details
    - Taxable Income
    - Book Profit under MAT (where applicable)
    - Adjusted Total Income under AMT (where applicable)
    - Net Tax Payable
    - Interest and Fee Payable
    - Total Tax, Interest, and Fee Payable
    - Taxes Paid
    - (+) Tax Payable / (-) Refundable
  
    Business Performance
    - Current Year Business Loss (if any)
    - Profit or Loss Statement
  
    Accreted Income & Tax Details
    - Accreted Income as per Section 115TD
    - Additional Tax Payable u/s 115TD
    - Interest Payable u/s 115TE
    - Additional Tax and Interest Payable
    - Tax and Interest Paid
    - (+) Tax Payable / (-) Refundable
  
    Filing Information
    - Acknowledgement Number
    - Date of Filing
    - PAN
    - Status
    - Form Number
    - Filed u/s
    - e-Filing Acknowledgement Number
    - Income Tax Return Submission Details (including IP address, verification method, and date)`;

    try {
      const response = await fetch(import.meta.env.VITE_APP_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setResponseText(data.response);
      formatResponseText(data.response); // Format the response text on fetch
      
    } catch (error) {
      console.error("An error occurred:", error);
    }
    
    setIsLoading(false);
  };

  const formatResponseText = (text) => {
    // Remove unwanted characters
    let cleanedText = text.replace(/[\*#]/g, '');
    // Split text into lines and format each line
    cleanedText = cleanedText.split('\n').map(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        return `<strong>${parts[0].trim()}</strong>: ${parts[1].trim()}`;
      }
      return line;
    }).join('<br/>');
    setFormattedText(cleanedText);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    doc.fromHTML(formattedText, 40, 40, {
      width: 522, // A4 width 595.28 - (left + right margin)
    });
    doc.save('report.pdf');
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? 'Loading...' : 'Generate Report'}
        </button>
      </form>
      {formattedText && (
        <div className={styles.responseText}>
          <div dangerouslySetInnerHTML={{ __html: formattedText }} />
          <button onClick={generatePDF} className={styles.button}>Download as PDF</button>
        </div>
      )}
    </div>
  );
};

Report.propTypes = {
  text: PropTypes.string.isRequired
};

export default Report;
