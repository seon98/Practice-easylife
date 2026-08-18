interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div>
      <label
        htmlFor="service-search"
        className="sr-only"
      >
        서비스 검색
      </label>

      <input
        id="service-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="서비스를 검색하세요..."
        autoComplete="off"
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
      />
    </div>
  );
}