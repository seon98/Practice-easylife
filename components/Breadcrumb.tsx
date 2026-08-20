import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({
  items,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="현재 위치"
      className="text-sm"
    >
      <ol className="flex flex-wrap items-center gap-2 text-gray-500">
        {items.map((item, index) => {
          const isLast =
            index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="text-gray-300"
                >
                  /
                </span>
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-gray-950 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "font-medium text-gray-900"
                      : undefined
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}