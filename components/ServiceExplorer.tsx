"use client";

import { useState } from "react";

import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import ServiceCard from "@/components/ServiceCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Service } from "@/types/service";

interface ServiceExplorerProps {
  services: Service[];
}

const ALL_CATEGORY = "전체";

export default function ServiceExplorer({
  services,
}: ServiceExplorerProps) {
  // 검색어 상태
  const [searchQuery, setSearchQuery] =
    useState("");

  // 선택된 카테고리
  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(ALL_CATEGORY);

  // 즐겨찾기만 보기 여부
  const [
    showFavoritesOnly,
    setShowFavoritesOnly,
  ] = useState(false);

  /**
   * 즐겨찾기 상태와 로직은
   * Custom Hook에서 관리합니다.
   */
  const {
    favoriteIds,
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  /**
   * 서비스 데이터에서 카테고리를 추출하고
   * Set으로 중복을 제거합니다.
   */
  const categories = [
    ALL_CATEGORY,
    ...new Set(
      services.map(
        (service) => service.category,
      ),
    ),
  ];

  /**
   * 검색어 정규화
   */
  const normalizedQuery = searchQuery
    .trim()
    .toLocaleLowerCase("ko-KR");

  /**
   * 검색어 + 카테고리 + 즐겨찾기 조건을
   * 모두 적용합니다.
   */
  const filteredServices = services.filter(
    (service) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORY ||
        service.category ===
          selectedCategory;

      const searchableText = [
        service.name,
        service.description,
        service.category,
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesSearch =
        normalizedQuery === "" ||
        searchableText.includes(
          normalizedQuery,
        );

      const matchesFavorite =
        !showFavoritesOnly ||
        favoriteIds.includes(service.id);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesFavorite
      );
    },
  );

  /**
   * 검색/카테고리/즐겨찾기 필터 초기화
   */
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(ALL_CATEGORY);
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== ALL_CATEGORY ||
    showFavoritesOnly;

  return (
    <>
      {/* 검색 및 필터 영역 */}
      <div className="mb-10 space-y-5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={
            selectedCategory
          }
          onSelect={setSelectedCategory}
        />

        {/* 즐겨찾기 필터 */}
        <button
          type="button"
          onClick={() =>
            setShowFavoritesOnly(
              (current) => !current,
            )
          }
          aria-pressed={showFavoritesOnly}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            showFavoritesOnly
              ? "bg-yellow-400 text-gray-950"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
          ].join(" ")}
        >
          ★ 즐겨찾기만 보기 (
          {favoriteIds.length})
        </button>
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

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-gray-600 hover:text-gray-950 hover:underline"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 서비스 목록 */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map(
            (service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isFavorite={isFavorite(
                  service.id,
                )}
                onToggleFavorite={
                  toggleFavorite
                }
              />
            ),
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            표시할 서비스가 없습니다.
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            검색어나 카테고리 또는
            즐겨찾기 조건을 확인해 주세요.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            전체 서비스 보기
          </button>
        </div>
      )}
    </>
  );
}