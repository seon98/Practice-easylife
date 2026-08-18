"use client";

import { useState } from "react";

import type { Service } from "@/types/service";

import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import ServiceCard from "@/components/ServiceCard";

interface ServiceExplorerProps {
  services: Service[];
}

const ALL_CATEGORY = "전체";

export default function ServiceExplorer({
  services,
}: ServiceExplorerProps) {
  // 사용자가 입력한 검색어
  const [searchQuery, setSearchQuery] = useState("");

  // 사용자가 선택한 카테고리
  const [selectedCategory, setSelectedCategory] =
    useState(ALL_CATEGORY);

  // 서비스 데이터에서 중복 카테고리를 제거해 필터 목록 생성
  const categories = [
    ALL_CATEGORY,
    ...new Set(services.map((service) => service.category)),
  ];

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");

  // 검색어와 카테고리를 모두 만족하는 서비스만 반환
  const filteredServices = services.filter((service) => {
    const matchesCategory =
      selectedCategory === ALL_CATEGORY ||
      service.category === selectedCategory;

    const searchableText = [
      service.name,
      service.description,
      service.category,
    ]
      .join(" ")
      .toLocaleLowerCase("ko-KR");

    const matchesSearch =
      normalizedQuery === "" ||
      searchableText.includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(ALL_CATEGORY);
  };

  return (
    <>
      {/* 검색 / 필터 영역 */}
      <div className="mb-10 space-y-5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* 검색 결과 정보 */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <p
          className="text-sm text-gray-500"
          aria-live="polite"
        >
          검색 결과{" "}
          <strong className="font-semibold text-gray-900">
            {filteredServices.length}
          </strong>
          개
        </p>

        {(searchQuery || selectedCategory !== ALL_CATEGORY) && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-gray-600 hover:text-gray-950 hover:underline"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            검색 결과가 없습니다.
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            다른 검색어나 카테고리를 선택해 주세요.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            전체 서비스 보기
          </button>
        </div>
      )}
    </>
  );
}