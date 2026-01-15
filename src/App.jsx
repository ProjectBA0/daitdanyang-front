import React from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";


import Navbar from "./components/Navbar";
import PostForm from "./components/PostForm";
import Category from "./components/Category";
import Product from "./components/Product";
import ScrollManager from "./components/ScrollManager";

import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FindAccount from "./pages/FindAccount";
import CartPage from "./pages/Cart";
import OrderComplete from "./pages/OrderComplete/OrderComplete";

import MyPageLayout from "./pages/MyPage/MyPageLayout";

// 쇼핑정보
import OrderList from "./pages/MyPage/shopping/OrderList";
import ReturnCancel from "./pages/MyPage/shopping/ReturnCancel";
import WishlistPage from "./pages/MyPage/shopping/Wishlist"; 

// 회원정보
import EditProfile from "./pages/MyPage/member/EditProfile";
import Withdraw from "./pages/MyPage/member/Withdraw";

// 기타
import MyQna from "./pages/MyPage/MyQna";
import MyReview from "./pages/MyPage/MyReview";
import Recent from "./components/recent";

import Footer from './components/Footer'; 
import MainPage from "./pages/MainPage"; 
import EventPage from "./pages/EventPage"; 
import EventDetail from "./components/Event/EventDetail"; // ✅ Added EventDetail Import
import CustomerCenterPage from "./pages/CustomerCenterPage"; 
import Chatbot from "./components/Chatbot"; 
import Noticeboard from "./components/Noticeboard";
import NoticeDetail from "./components/NoticeDetail";
import EditPost from "./components/EditPost";
import Order from "./components/Order";
import AdminPostForm from "./components/AdminPostForm";
import SearchPage from "./pages/SearchPage"; // 🦁 Import SearchPage


/** ✅ 네비바가 필요한 페이지들의 공통 틀 */
function MainLayout() {
  return (
    <div className="MainLayout">
      <Navbar />
      {/* ✅ 여기(Outlet)에 자식 페이지가 들어옴 */}
      <Outlet />
      <Footer /> {/* 2025-12-24: 하단 공통 푸터 배치 */}
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <ScrollManager />
      <Routes>
        {/* ✅ 네비바 없는 구역 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ 네비바 있는 구역 */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<MainPage />} />

          {/* 기존 페이지들 */}
          <Route path="category/:pet/:sub?" element={<Category />} />
          <Route path="/search" element={<SearchPage />} /> {/* 🦁 검색 페이지 */}
          <Route path="product/:id" element={<Product />} />
           <Route path="/write" element={<PostForm />} /> 
          <Route path="find-account" element={<FindAccount />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="order/complete" element={<OrderComplete />} />
          <Route path="/events" element={<EventPage />} /> {/* Navbar의 /events와 매핑 */}
          <Route path="/events/:id" element={<EventDetail />} /> {/* ✅ 이벤트 상세 페이지 추가 */}
          <Route path="/support" element={<CustomerCenterPage />} /> {/* Navbar의 /support와 매핑 */}
          <Route path="/Noticeboard" element={<Noticeboard />} />
          <Route path="/Noticeboard/:id" element={<NoticeDetail />} />
          <Route path="/Noticeboard/edit/:id" element={<EditPost />} /> 
          <Route path="/order/:orderId" element={<Order />} />

          <Route path="/AdminPostForm" element={<AdminPostForm />} />
          <Route path="/AdminPostForm/:id" element={<AdminPostForm />} /> {/* 🦁 수정 모드 라우트 추가 */}
          <Route path="/view" element={<Recent />} />


          {/* ✅ 마이페이지 */}
          <Route path="mypage" element={<MyPageLayout />}>
            <Route index element={<Navigate to="shopping/orders" replace />} />

            <Route path="shopping/orders" element={<OrderList />} />
            <Route path="shopping/returns" element={<ReturnCancel />} />

            <Route path="shopping/wishlist" element={<WishlistPage />} /> {/* 찜목록 (마이페이지) */}

            <Route path="member/edit" element={<EditProfile />} />
            <Route path="member/withdraw" element={<Withdraw />} />

            <Route path="qna" element={<MyQna />} />
            <Route path="review" element={<MyReview />} />
          </Route>

          {/* 네비바 있는 구역의 404 */}
          <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
        </Route>

        {/* 전체 404 */}
        <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </div>
  );
}