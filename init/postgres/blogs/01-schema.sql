--
-- PostgreSQL database dump
--

\restrict bEefuJq26o9z0r9xby2zYiqGuaAtkKLJzxGdT44LLMDh38nBlITgExkVmfUnjmL

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blog_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_likes (
    id uuid NOT NULL,
    blog_post_id uuid NOT NULL,
    user_id character varying(255) NOT NULL
);


ALTER TABLE public.blog_likes OWNER TO postgres;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id uuid NOT NULL,
    author_id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text NOT NULL,
    image_urls text,
    likes_count integer NOT NULL,
    title character varying(255) NOT NULL
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    author_id character varying(255) NOT NULL,
    blog_post_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: blog_likes blog_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: blog_likes uk1r5lk05bokpsfwgrvp5ojeqgl; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT uk1r5lk05bokpsfwgrvp5ojeqgl UNIQUE (blog_post_id, user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict bEefuJq26o9z0r9xby2zYiqGuaAtkKLJzxGdT44LLMDh38nBlITgExkVmfUnjmL

