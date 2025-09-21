
export const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || statusStyles.inactive}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
