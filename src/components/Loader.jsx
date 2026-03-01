const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">{text}</p>
    </div>
  );
};

export default Loader;
