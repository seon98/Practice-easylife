import type { Metadata } from "next";
import FeedbackForm from "@/components/feedback/FeedbackForm";

export const metadata: Metadata = { title: "문의·오류 신고", description: "EasyLife 콘텐츠 수정 요청, 깨진 링크 및 개인정보 문의를 접수합니다." };

export default function ContactPage() {
  return <main className="mx-auto min-h-screen max-w-3xl px-6 py-12"><p className="text-sm font-semibold text-blue-700">Contact</p><h1 className="mt-3 text-4xl font-bold">문의·오류 신고</h1><p className="mt-4 leading-7 text-gray-600">정책 변경, 잘못된 설명, 연결되지 않는 공식 링크 또는 서비스 이용 의견을 보내주세요. 주민등록번호, 계좌번호, 건강정보 등 민감한 개인정보는 입력하지 마세요.</p><div className="mt-10"><FeedbackForm/></div></main>;
}
