--
-- PostgreSQL database dump
--

\restrict HIAKGWv0GAoJGbVPWZoLi1pqIZjsEY5rkpZA2JdiANQEJnJFxAirt8AN3LPehEQ

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: userservice; Owner: postgres
--

INSERT INTO userservice.users (id, avatar_url, created_at, email, email_verified, full_name, last_login, password_hash, phone, role, status, updated_at) VALUES ('4d372b5a-d460-4143-8fae-70bd901133cd', NULL, '2026-01-07 16:41:12.846392', 'student1@test.com', false, 'Student 1', NULL, '$2a$10$A96cb1GLjTIzZjUkPYrwhOHa8nCq4cNj/EdiSPF7x4IzQJkG1ynOq', NULL, 'STUDENT', 'ACTIVE', '2026-01-07 16:41:12.846392');
INSERT INTO userservice.users (id, avatar_url, created_at, email, email_verified, full_name, last_login, password_hash, phone, role, status, updated_at) VALUES ('ac6d6024-28d7-4308-885e-1bfe24e0ead8', NULL, '2026-01-12 15:05:55.396321', 'admin@careermate.vn', true, 'System Admin', '2026-01-12 15:07:28.336377', '$2a$10$cBOa8xrbLrSUQf9kaxIMwudzU2plbjvS6srFy4Nusnf9JQcvA6u0S', NULL, 'ADMIN', 'ACTIVE', '2026-01-12 15:07:28.358279');
INSERT INTO userservice.users (id, avatar_url, created_at, email, email_verified, full_name, last_login, password_hash, phone, role, status, updated_at) VALUES ('940fc45c-c5eb-4718-bcd2-021079a233dc', NULL, '2026-01-07 20:56:46.015536', 'nguyentann0804@gmail.com', false, 'Nguyễn Văn Tân', '2026-01-17 00:49:38.497341', '$2a$10$m3BRY3ib/LRi7w25fxbYg.JSOVHrqGBE0dBE6bIfx5iHSJpja3Gxm', NULL, 'STUDENT', 'ACTIVE', '2026-01-17 00:49:38.507372');
INSERT INTO userservice.users (id, avatar_url, created_at, email, email_verified, full_name, last_login, password_hash, phone, role, status, updated_at) VALUES ('cb8b9c15-32e0-4acb-b82c-ce33abb91fdd', '/uploads/avatars/e7a35096-48ef-4c7c-8441-4301d191ccce.jpg', '2026-01-12 13:55:06.509645', 'nguyentann080405@gmail.com', false, 'Trần Tài', '2026-01-12 13:55:14.378476', '$2a$10$QGUvkokUaaeRC7FrZw5hQ.bIdDV2/fRevszli5ZCd0VJgTPjee0ZO', NULL, 'RECRUITER', 'ACTIVE', '2026-01-17 03:29:49.265549');
INSERT INTO userservice.users (id, avatar_url, created_at, email, email_verified, full_name, last_login, password_hash, phone, role, status, updated_at) VALUES ('71aeb987-1863-42bb-9b9e-e72869f8a82f', NULL, '2026-01-07 21:27:54.294268', 'tannv2615@ut.edu.vn', false, 'Nguyễn Văn Tân', '2026-01-08 17:39:35.683005', '$2a$10$pxp/50rKsNxtd3alaIUxx.UfvODa1XDi6xoX09Zjl3lKtmjtbaR3C', NULL, 'STUDENT', 'ACTIVE', '2026-01-17 14:27:38.375754');


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: userservice; Owner: postgres
--

INSERT INTO userservice.conversations (id, participant1_id, participant2_id, last_message_at, created_at, updated_at) VALUES ('b5609a37-6bc3-43d8-ba6f-dc0b9885b443', '940fc45c-c5eb-4718-bcd2-021079a233dc', 'cb8b9c15-32e0-4acb-b82c-ce33abb91fdd', NULL, '2026-01-16 21:56:04.888427', '2026-01-16 22:52:17.632137');
INSERT INTO userservice.conversations (id, participant1_id, participant2_id, last_message_at, created_at, updated_at) VALUES ('7ea8a1dd-e30d-4d7a-81e0-86551db0d083', 'ac6d6024-28d7-4308-885e-1bfe24e0ead8', 'cb8b9c15-32e0-4acb-b82c-ce33abb91fdd', '2026-01-17 00:51:27.994739', '2026-01-16 22:53:01.101631', '2026-01-17 00:51:28.026448');


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: userservice; Owner: postgres
--

INSERT INTO userservice.student_profiles (id, address, bio, city, country, created_at, current_status, date_of_birth, gender, github_url, gpa, graduation_year, linkedin_url, major, portfolio_url, university, updated_at, user_id, avatar_url) VALUES ('a9e32b5b-d336-429a-8a31-5ef8aab9eccb', NULL, NULL, NULL, 'Vietnam', '2026-01-07 16:41:12.918526', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-07 16:41:12.918526', '4d372b5a-d460-4143-8fae-70bd901133cd', NULL);
INSERT INTO userservice.student_profiles (id, address, bio, city, country, created_at, current_status, date_of_birth, gender, github_url, gpa, graduation_year, linkedin_url, major, portfolio_url, university, updated_at, user_id, avatar_url) VALUES ('8ba6e8e9-af72-4c20-8bcd-a85fe3c650b0', 'HCM', 'VIP PRO', 'HCM', 'Vietnam', '2026-01-07 21:27:54.308551', 'STUDENT', '2005-04-08', 'MALE', NULL, 3.10, 2026, NULL, 'CNTT', NULL, 'GTVT', '2026-01-09 21:40:46.797617', '71aeb987-1863-42bb-9b9e-e72869f8a82f', '/uploads/avatars/527c62be-f50e-4471-ad72-41c21f42969a.jpg');
INSERT INTO userservice.student_profiles (id, address, bio, city, country, created_at, current_status, date_of_birth, gender, github_url, gpa, graduation_year, linkedin_url, major, portfolio_url, university, updated_at, user_id, avatar_url) VALUES ('425b33b7-af19-4b75-9b69-540e7d1f4161', 'HCM', 'VIP PRO', 'HCM', 'Vietnam', '2026-01-07 20:56:46.048248', 'JOB_SEEKING', '2019-03-01', 'MALE', NULL, NULL, 2026, NULL, 'CNTT', NULL, 'GTVT', '2026-01-17 03:28:05.990532', '940fc45c-c5eb-4718-bcd2-021079a233dc', '/uploads/avatars/008f61d9-c329-4fa7-addd-2eb1e0b4540c.jpg');


--
-- Data for Name: cvs; Type: TABLE DATA; Schema: userservice; Owner: postgres
--

INSERT INTO userservice.cvs (id, ai_analysis, ai_score, created_at, file_name, file_size, file_type, file_url, is_default, updated_at, student_id) VALUES ('1ce19e2a-caf9-433c-af70-9a3555a2177a', NULL, NULL, '2026-01-08 19:27:08.536877', 'Nguyen-Van-Tan-TopCV.vn-241225.221256.pdf', 239716, 'application/pdf', '/uploads/cvs/226d4d33-c331-426c-9fe8-c67de9b943e8.pdf', false, '2026-01-08 19:27:08.536877', '8ba6e8e9-af72-4c20-8bcd-a85fe3c650b0');
INSERT INTO userservice.cvs (id, ai_analysis, ai_score, created_at, file_name, file_size, file_type, file_url, is_default, updated_at, student_id) VALUES ('04f561e5-d7ba-4434-ad1b-88c7da16223e', NULL, NULL, '2026-01-09 20:46:48.468751', 'Nguyen-Van-Tan-TopCV.vn-241225.221256.pdf', 239716, 'application/pdf', '/uploads/cvs/c74faeb4-362f-401c-82e6-51c116df201a.pdf', false, '2026-01-09 20:46:48.468751', '8ba6e8e9-af72-4c20-8bcd-a85fe3c650b0');
INSERT INTO userservice.cvs (id, ai_analysis, ai_score, created_at, file_name, file_size, file_type, file_url, is_default, updated_at, student_id) VALUES ('42fb7e6e-e490-4a9c-9785-60a03822104e', NULL, NULL, '2026-01-12 15:46:54.322221', 'Nguyen-Van-Tan-TopCV.vn-241225.221256.pdf', 239716, 'application/pdf', '/uploads/cvs/1cf20530-4350-44fc-ad7a-ddb071ed1481.pdf', false, '2026-01-12 15:46:54.322221', '425b33b7-af19-4b75-9b69-540e7d1f4161');
INSERT INTO userservice.cvs (id, ai_analysis, ai_score, created_at, file_name, file_size, file_type, file_url, is_default, updated_at, student_id) VALUES ('9f485eba-abad-4737-add9-6e36554864bb', NULL, NULL, '2026-01-17 01:06:03.188813', 'CV_Nguy_n_V_n_T_n_425d1336.html', 4662, 'text/html', '/uploads/cvs/CV_Nguy_n_V_n_T_n_425d1336.html', false, '2026-01-17 01:06:03.188813', '425b33b7-af19-4b75-9b69-540e7d1f4161');
INSERT INTO userservice.cvs (id, ai_analysis, ai_score, created_at, file_name, file_size, file_type, file_url, is_default, updated_at, student_id) VALUES ('cc769a2d-b07a-4751-b9aa-ba8ef9bf5148', NULL, NULL, '2026-01-17 01:47:08.751958', 'CV_Nguy_n_V_n_T_n_3bc2ed06.html', 3175, 'text/html', '/uploads/cvs/CV_Nguy_n_V_n_T_n_3bc2ed06.html', false, '2026-01-17 01:47:08.751958', '425b33b7-af19-4b75-9b69-540e7d1f4161');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: userservice; Owner: postgres
--

INSERT INTO userservice.messages (id, conversation_id, sender_id, content, is_read, created_at, updated_at) VALUES ('1aa00133-68b1-4304-b142-6a1ddaf6297b', '7ea8a1dd-e30d-4d7a-81e0-86551db0d083', 'ac6d6024-28d7-4308-885e-1bfe24e0ead8', 'hi', true, '2026-01-17 00:51:27.970112', '2026-01-17 00:51:28.031112');


--
-- Data for Name: recruiter_profiles; Type: TABLE DATA; Schema: userservice; Owner: postgres
--

INSERT INTO userservice.recruiter_profiles (id, bio, created_at, department, phone, "position", updated_at, company_id, user_id) VALUES ('c469b68c-215f-4f2f-8275-c1d9a60d58d9', '', '2026-01-12 13:55:06.539487', 'trưởng phòng nhân sự', '0123456789', 'Nhà tuyển dụng', '2026-01-16 23:11:57.25713', '9e2a829d-da08-43a1-975a-1b6e225568cd', 'cb8b9c15-32e0-4acb-b82c-ce33abb91fdd');


--
-- Data for Name: student_skills; Type: TABLE DATA; Schema: userservice; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

\unrestrict HIAKGWv0GAoJGbVPWZoLi1pqIZjsEY5rkpZA2JdiANQEJnJFxAirt8AN3LPehEQ

