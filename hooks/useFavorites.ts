"use client";

import {
  useCallback,
  useSyncExternalStore,
} from "react";

const FAVORITES_KEY = "easylife-favorites";
const FAVORITES_CHANGED_EVENT =
  "easylife:favorites-changed";

/**
 * 서버 렌더링 시 사용할 빈 즐겨찾기 목록입니다.
 *
 * useSyncExternalStore의 snapshot은
 * 값이 변경되지 않았다면 같은 참조를 반환해야 하므로
 * 상수로 관리합니다.
 */
const EMPTY_FAVORITES: readonly number[] = [];

/**
 * localStorage 데이터를 안전하게 읽습니다.
 *
 * localStorage 값은 신뢰할 수 없는 외부 데이터이므로
 * JSON 형식과 데이터 타입을 검증합니다.
 */
function readFavoritesFromStorage(): readonly number[] {
  if (typeof window === "undefined") {
    return EMPTY_FAVORITES;
  }

  try {
    const raw =
      window.localStorage.getItem(FAVORITES_KEY);

    if (!raw) {
      return EMPTY_FAVORITES;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return EMPTY_FAVORITES;
    }

    const validIds = parsed.filter(
      (id): id is number =>
        typeof id === "number" &&
        Number.isSafeInteger(id) &&
        id > 0,
    );

    if (validIds.length === 0) {
      return EMPTY_FAVORITES;
    }

    // 중복 ID 제거
    return [...new Set(validIds)];
  } catch {
    return EMPTY_FAVORITES;
  }
}

/**
 * 브라우저에서 모듈이 로드될 때
 * localStorage의 현재 상태를 읽어 외부 Store 상태로 사용합니다.
 *
 * 서버에서는 localStorage가 존재하지 않으므로 빈 배열을 사용합니다.
 */
let currentSnapshot: readonly number[] =
  typeof window === "undefined"
    ? EMPTY_FAVORITES
    : readFavoritesFromStorage();

/**
 * React가 현재 외부 Store 값을 읽을 때 호출합니다.
 */
function getSnapshot(): readonly number[] {
  return currentSnapshot;
}

/**
 * 서버 렌더링 및 hydration 첫 렌더링에서는
 * localStorage를 사용할 수 없으므로 빈 배열을 반환합니다.
 */
function getServerSnapshot(): readonly number[] {
  return EMPTY_FAVORITES;
}

/**
 * localStorage 변경을 React에 알려줍니다.
 *
 * storage 이벤트:
 *   다른 브라우저 탭에서 localStorage가 변경된 경우
 *
 * FAVORITES_CHANGED_EVENT:
 *   현재 탭에서 즐겨찾기가 변경된 경우
 */
function subscribe(
  callback: () => void,
): () => void {
  const handleStorageChange = (
    event: StorageEvent,
  ) => {
    if (
      event.storageArea === window.localStorage &&
      event.key === FAVORITES_KEY
    ) {
      currentSnapshot =
        readFavoritesFromStorage();

      callback();
    }
  };

  const handleLocalChange = () => {
    callback();
  };

  window.addEventListener(
    "storage",
    handleStorageChange,
  );

  window.addEventListener(
    FAVORITES_CHANGED_EVENT,
    handleLocalChange,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorageChange,
    );

    window.removeEventListener(
      FAVORITES_CHANGED_EVENT,
      handleLocalChange,
    );
  };
}

/**
 * 즐겨찾기를 localStorage에 저장합니다.
 */
function saveFavorites(
  favoriteIds: readonly number[],
): void {
  const normalizedIds = [
    ...new Set(favoriteIds),
  ];

  try {
    window.localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(normalizedIds),
    );

    // 외부 Store 상태 갱신
    currentSnapshot = normalizedIds;

    /**
     * 같은 탭에서는 storage 이벤트가 발생하지 않으므로
     * 직접 커스텀 이벤트를 발생시킵니다.
     */
    window.dispatchEvent(
      new Event(FAVORITES_CHANGED_EVENT),
    );
  } catch (error) {
    console.error(
      "즐겨찾기를 저장하지 못했습니다.",
      error,
    );
  }
}

/**
 * hydration 여부 확인용 외부 Store입니다.
 *
 * 서버: false
 * 브라우저 hydration 완료 후: true
 */
function subscribeHydration(): () => void {
  return () => {};
}

function getClientHydrationSnapshot(): boolean {
  return true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

/**
 * EasyLife 즐겨찾기 Custom Hook
 *
 * 즐겨찾기 관련 로직을 여러 컴포넌트에서
 * 중복 구현하지 않도록 한곳에서 관리합니다.
 */
export function useFavorites() {
  const favoriteIds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  /**
   * 즐겨찾기에 존재하면 제거하고
   * 존재하지 않으면 추가합니다.
   */
  const toggleFavorite = useCallback(
    (serviceId: number) => {
      const currentIds = getSnapshot();

      const nextIds = currentIds.includes(
        serviceId,
      )
        ? currentIds.filter(
            (id) => id !== serviceId,
          )
        : [...currentIds, serviceId];

      saveFavorites(nextIds);
    },
    [],
  );

  /**
   * 특정 서비스가 즐겨찾기인지 확인합니다.
   */
  const isFavorite = useCallback(
    (serviceId: number) =>
      favoriteIds.includes(serviceId),
    [favoriteIds],
  );

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    isHydrated,
  };
}