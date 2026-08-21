import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "EasyLife 소개", description: "생활의 변화가 생겼을 때 해야 할 일을 순서대로 안내하는 EasyLife의 운영 원칙을 소개합니다." };

export default function AboutPage() {
  return <main className="mx-auto min-h-screen max-w-4xl px-6 py-12"><p className="text-sm font-semibold text-blue-700">About EasyLife</p><h1 className="mt-3 text-4xl font-bold">생활의 다음 행동을 찾기 쉽게</h1><p className="mt-6 text-lg leading-8 text-gray-600">EasyLife는 기관 이름이나 제도명을 몰라도 이사·퇴사·취업·창업·출산처럼 지금 겪는 상황에서 무엇을 어떤 순서로 확인해야 하는지 안내하는 생활 내비게이션입니다.</p><div className="mt-12 grid gap-5 md:grid-cols-3"><article className="rounded-2xl border bg-white p-6"><h2 className="font-bold">공식 출처 우선</h2><p className="mt-3 text-sm leading-6 text-gray-600">정부와 공공기관의 공식 안내를 최종 확인처로 연결합니다.</p></article><article className="rounded-2xl border bg-white p-6"><h2 className="font-bold">행동 순서 중심</h2><p className="mt-3 text-sm leading-6 text-gray-600">정보 나열보다 준비물·기한·완료 여부를 중심으로 구성합니다.</p></article><article className="rounded-2xl border bg-white p-6"><h2 className="font-bold">광고와 추천 분리</h2><p className="mt-3 text-sm leading-6 text-gray-600">광고·제휴 콘텐츠는 일반 안내와 구분하며 추천 점수에 영향을 주지 않습니다.</p></article></div><section className="mt-12 rounded-2xl bg-gray-950 p-8 text-white"><h2 className="text-2xl font-bold">정보가 달라졌나요?</h2><p className="mt-3 leading-7 text-gray-300">정책과 신청 절차는 변경될 수 있습니다. 잘못된 내용이나 깨진 링크를 발견하면 알려주세요.</p><Link href="/contact" className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 font-semibold text-gray-950">수정 요청하기 →</Link></section></main>;
}
