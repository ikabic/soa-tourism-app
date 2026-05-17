--
-- PostgreSQL database dump
--

\restrict K9v8bDaymONRrOeteHw82FZdmgJWszIEqzb5754d3rkj8h7jdJ9zTGnS3byYt8e

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
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    tour_id uuid NOT NULL,
    tour_name text NOT NULL,
    tour_description text DEFAULT ''::text NOT NULL,
    price double precision NOT NULL,
    created_at timestamp with time zone
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    tour_id uuid NOT NULL,
    tour_name text NOT NULL,
    tour_description text DEFAULT ''::text NOT NULL,
    price double precision NOT NULL,
    token text NOT NULL,
    created_at timestamp with time zone
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: idx_cart_items_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);


--
-- Name: idx_cart_user_tour; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_cart_user_tour ON public.cart_items USING btree (user_id, tour_id);


--
-- Name: idx_purchase_user_tour; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_purchase_user_tour ON public.purchases USING btree (user_id, tour_id);


--
-- Name: idx_purchases_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_purchases_token ON public.purchases USING btree (token);


--
-- Name: idx_purchases_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_user_id ON public.purchases USING btree (user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict K9v8bDaymONRrOeteHw82FZdmgJWszIEqzb5754d3rkj8h7jdJ9zTGnS3byYt8e

