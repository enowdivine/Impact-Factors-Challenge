export const differenceInMonths = (date1: Date, date2: Date): number => {
  return (
    date1.getFullYear() * 12 +
    date1.getMonth() -
    (date2.getFullYear() * 12 + date2.getMonth())
  );
};

export const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000);
