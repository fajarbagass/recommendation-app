const FormatRupiah = (props) => {
  const numberString = props.number.toString();
  const rupiah = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberString);
  return rupiah;
};

export default FormatRupiah;
