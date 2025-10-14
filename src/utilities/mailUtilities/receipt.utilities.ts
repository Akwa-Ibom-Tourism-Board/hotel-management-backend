const generateTransactionReceipt = (transaction: {
  reference: string;
  amount: number;
  type: "credit" | "debit";
  status: "pending" | "completed" | "failed";
  date: Date;
  userEventyzzeId: string;
  description: string
}): string => {
  return `
  <div style="width: 60%; margin: 20px auto; padding: 20px; border-radius: 10px; border: 2px solid #ffd700; background-color: #fdf9f3; font-family: Arial, sans-serif; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h2 style="text-align: center; font-size: 28px; color: #d2691e; margin-bottom: 20px;">Eventyzze Transaction Receipt</h2>
    <p style="font-size: 16px; color: #555; text-align: center; margin-bottom: 20px;">
      Below are the details of your recent transaction:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr style="background-color: #f9f2d7;">
        <td style="padding: 10px; font-weight: bold; color: #8b4513;">Transaction Reference:</td>
        <td style="padding: 10px; color: #555;">${transaction.reference}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #8b4513;">Amount:</td>
        <td style="padding: 10px; color: #555;">$${transaction.amount.toFixed(
          2
        )}</td>
      </tr>
       <tr>
        <td style="padding: 10px; font-weight: bold; color: #8b4513;">Description:</td>
        <td style="padding: 10px; color: #555;">${transaction.description}</td>
      </tr>
      <tr style="background-color: #f9f2d7;">
        <td style="padding: 10px; font-weight: bold; color: #8b4513;">Transaction Type:</td>
        <td style="padding: 10px; color: #555;">${transaction.type}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #8b4513;">Status:</td>
        <td style="padding: 10px; color: ${
          transaction.status === "completed"
            ? "#2e8b57"
            : transaction.status === "failed"
            ? "#ff4500"
            : "#d2691e"
        };">
          ${
            transaction.status.charAt(0).toUpperCase() +
            transaction.status.slice(1)
          }
        </td>
      </tr>
      <tr style="background-color: #f9f2d7;">
        <td style="padding: 10px; font-weight: bold; color: #8b4513;">Date:</td>
        <td style="padding: 10px; color: #555;">${transaction.date}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #8b4513;">User ID:</td>
        <td style="padding: 10px; color: #555;">${
          transaction.userEventyzzeId
        }</td>
      </tr>
    </table>
    <p style="font-size: 16px; color: #555; text-align: center; margin-bottom: 20px;">
      If you have any questions, please contact our support team.
    </p>
    <div style="text-align: center;">
      <p style="font-size: 16px; color: #2e8b57; margin-bottom: 10px;">Thank you for choosing us! We value you!</p>
      <strong style="color: #ff4500; font-size: 18px;">The Eventyzze Team</strong>
    </div>
  </div>
`;
};

export default generateTransactionReceipt;
