export const AlertBanner = ({ alert }) => {
  return <div className={`alert-banner ${alert.type}`}>{alert.msg}</div>;
};
