import { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  // Container chính
  container: {
    maxWidth: '900px',
    margin: '0px auto',
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
  },

  containerSuccess: {
    maxWidth: '1100px',
    margin: '0px auto',
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
  },

  containerEdit: {
    margin: '0 auto',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    overflowX: "hidden",
  },

  // Icon header
  icon: {
    fontSize: '60px',
    margin: '0 auto 16px auto',
    display: 'block',
  },

  // Tiêu đề
  title: {
    fontSize: '24px',
    marginBottom: '8px',
    color: "#1C3D90",
  },

  text: {
    fontSize: '18px',
    marginBottom: '8px',
  },

  subText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
  },

  // Nhóm nút
  buttonGroup: {
    display: 'flex',
    justifyContent: 'right',
    gap: '15px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },

  button: {
    padding: '12px 26px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },

  // Container thông tin đơn hàng
  infoContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '1400px',
    margin: '0 auto 30px',
    gap: '20px',
  },

  rowContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },

  section: {
    backgroundColor: '#fafafa',
    padding: '20px 24px',
    borderRadius: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
  },

  infoBox: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: '20px',
    borderRadius: '8px',
    lineHeight: 1.6,
    textAlign: 'left',
  },

  productList: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    marginBottom: '30px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '12px',
  },

  th: {
    borderBottom: '2px solid #ccc',
    textAlign: 'left',
    padding: '10px',
    fontWeight: '600',
    color: '#333',
  },

  td: {
    borderBottom: '1px solid #eee',
    padding: '10px',
    color: '#555',
  },

  feeDetailsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },

  feeSection: {
    display: 'flex',
    gap: '24px',
  },

  paymentSummary: {
    flex: 1,
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: '#fffbe6',
    border: '1px solid #ffe58f',
    color: '#333',
    fontWeight: 500,
  },

  serviceFee: {
    flex: 1,
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: '#e8f5e9',
    border: '1px solid #a5d6a7',
    color: '#333',
    fontWeight: 500,
  },

  feeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontWeight: 500,
  },

  orderInfo: {
    backgroundColor: '#fafafa',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
  },

  paymentAndDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '32px',
  },
  customCard: {
    borderRadius: '12px',
    marginBottom: '30px',
    position: 'relative',
    border: '1px solid #e4e6eb',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.06)',
  },

  cardTitle: {
    position: 'absolute',
    top: '-12px',
    left: '16px',
    background: 'white',
    padding: '0 8px',
    fontWeight: 600,
    color: '#1C3D90',
    fontSize: '16px',
  },

  rowContainerEdit: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '8px',
  },

  cardTitleEdit: {
    position: "absolute",
    top: "-10px",
    left: "20px",
    background: "#fff",
    padding: "0 10px",
    fontWeight: 600,
    color: "#1C3D90",
    fontSize: "15px",
    lineHeight: 1.2,
    borderRadius: "4px",
    zIndex: 1,
  },

  buttonEdit: {
    position: "absolute",
    top: 24,
    right: 24,
    zIndex: 5,
    background: "#1C3D90",
    color: "#ffffff",
  },

  leftContent: {
    height: "calc(100vh - 120px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  scrollableContent: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: 8,
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflowAnchor: "none",
  },

  rightSidebar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "calc(100vh - 120px)",
    position: "sticky",
    top: "64px",
    backgroundColor: "#fff",
    padding: "0 16px 8px",
    boxSizing: "border-box",
  },

  buttonActionEdit: {
    padding: '12px 26px',
    fontSize: '0.9rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },

  containerStyle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
};
