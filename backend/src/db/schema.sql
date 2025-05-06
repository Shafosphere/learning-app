--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

-- Started on 2025-05-06 16:33:54 CEST

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
-- TOC entry 242 (class 1259 OID 16620)
-- Name: answer_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answer_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    word_id integer NOT NULL,
    given_answer character varying(255) NOT NULL,
    is_correct boolean NOT NULL,
    points_before integer NOT NULL,
    points_after integer NOT NULL,
    response_time_ms integer NOT NULL,
    difficulty_tier character varying(2) NOT NULL,
    streak integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.answer_history OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16619)
-- Name: answer_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.answer_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.answer_history_id_seq OWNER TO postgres;

--
-- TOC entry 4567 (class 0 OID 0)
-- Dependencies: 241
-- Name: answer_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.answer_history_id_seq OWNED BY public.answer_history.id;


--
-- TOC entry 240 (class 1259 OID 16605)
-- Name: arena; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arena (
    user_id integer NOT NULL,
    current_points integer DEFAULT 1000 NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    last_answered timestamp without time zone,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ranking_game_current_points_check CHECK (((current_points >= 0) AND (current_points <= 9999)))
);


ALTER TABLE public.arena OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16457)
-- Name: b2_patches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.b2_patches (
    patch_id integer NOT NULL,
    word_ids json
);


ALTER TABLE public.b2_patches OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16456)
-- Name: b2_patches_patch_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.b2_patches_patch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.b2_patches_patch_id_seq OWNER TO postgres;

--
-- TOC entry 4568 (class 0 OID 0)
-- Dependencies: 225
-- Name: b2_patches_patch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.b2_patches_patch_id_seq OWNED BY public.b2_patches.patch_id;


--
-- TOC entry 228 (class 1259 OID 16466)
-- Name: c1_patches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.c1_patches (
    patch_id integer NOT NULL,
    word_ids json
);


ALTER TABLE public.c1_patches OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16465)
-- Name: c1_patches_patch_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.c1_patches_patch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.c1_patches_patch_id_seq OWNER TO postgres;

--
-- TOC entry 4569 (class 0 OID 0)
-- Dependencies: 227
-- Name: c1_patches_patch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.c1_patches_patch_id_seq OWNED BY public.c1_patches.patch_id;


--
-- TOC entry 230 (class 1259 OID 16480)
-- Name: page_visit_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_visit_stats (
    id integer NOT NULL,
    page_name character varying(100) NOT NULL,
    stat_date date NOT NULL,
    visit_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.page_visit_stats OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16479)
-- Name: page_visit_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.page_visit_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.page_visit_stats_id_seq OWNER TO postgres;

--
-- TOC entry 4570 (class 0 OID 0)
-- Dependencies: 229
-- Name: page_visit_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.page_visit_stats_id_seq OWNED BY public.page_visit_stats.id;


--
-- TOC entry 236 (class 1259 OID 16518)
-- Name: ranking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ranking (
    id integer NOT NULL,
    user_id integer NOT NULL,
    username character varying(100) NOT NULL,
    flashcard_points integer DEFAULT 0 NOT NULL,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ban boolean DEFAULT false NOT NULL
);


ALTER TABLE public.ranking OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16517)
-- Name: ranking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ranking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ranking_id_seq OWNER TO postgres;

--
-- TOC entry 4571 (class 0 OID 0)
-- Dependencies: 235
-- Name: ranking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ranking_id_seq OWNED BY public.ranking.id;


--
-- TOC entry 215 (class 1259 OID 16389)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    user_id integer NOT NULL,
    report_type character varying(20) NOT NULL,
    word_id integer,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16395)
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- TOC entry 4572 (class 0 OID 0)
-- Dependencies: 216
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- TOC entry 217 (class 1259 OID 16396)
-- Name: translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translation (
    id integer NOT NULL,
    word_id integer NOT NULL,
    language character varying(2) NOT NULL,
    translation character varying(100) NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.translation OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16401)
-- Name: translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.translation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translation_id_seq OWNER TO postgres;

--
-- TOC entry 4573 (class 0 OID 0)
-- Dependencies: 218
-- Name: translation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.translation_id_seq OWNED BY public.translation.id;


--
-- TOC entry 232 (class 1259 OID 16490)
-- Name: user_activity_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_activity_stats (
    id integer NOT NULL,
    activity_date date NOT NULL,
    activity_type character varying(50) NOT NULL,
    activity_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_activity_stats OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16489)
-- Name: user_activity_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_activity_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_activity_stats_id_seq OWNER TO postgres;

--
-- TOC entry 4574 (class 0 OID 0)
-- Dependencies: 231
-- Name: user_activity_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_activity_stats_id_seq OWNED BY public.user_activity_stats.id;


--
-- TOC entry 238 (class 1259 OID 16540)
-- Name: user_autosave; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_autosave (
    id integer NOT NULL,
    user_id integer NOT NULL,
    level character varying(2) NOT NULL,
    words jsonb NOT NULL,
    device_identifier character varying(255),
    last_saved timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    version integer NOT NULL,
    patch_number_b2 integer DEFAULT 1,
    patch_number_c1 integer DEFAULT 1
);


ALTER TABLE public.user_autosave OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16539)
-- Name: user_autosave_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_autosave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_autosave_id_seq OWNER TO postgres;

--
-- TOC entry 4575 (class 0 OID 0)
-- Dependencies: 237
-- Name: user_autosave_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_autosave_id_seq OWNED BY public.user_autosave.id;


--
-- TOC entry 239 (class 1259 OID 16565)
-- Name: user_autosave_version_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_autosave_version_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_autosave_version_seq OWNER TO postgres;

--
-- TOC entry 4576 (class 0 OID 0)
-- Dependencies: 239
-- Name: user_autosave_version_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_autosave_version_seq OWNED BY public.user_autosave.version;


--
-- TOC entry 234 (class 1259 OID 16500)
-- Name: user_word_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_word_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    word_id integer NOT NULL,
    learned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_word_progress OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16499)
-- Name: user_word_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_word_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_word_progress_id_seq OWNER TO postgres;

--
-- TOC entry 4577 (class 0 OID 0)
-- Dependencies: 233
-- Name: user_word_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_word_progress_id_seq OWNED BY public.user_word_progress.id;


--
-- TOC entry 219 (class 1259 OID 16402)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    avatar integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16407)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4578 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 221 (class 1259 OID 16408)
-- Name: word; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.word (
    id integer NOT NULL,
    word character varying(100) NOT NULL,
    level character varying(2) DEFAULT 'B2'::character varying NOT NULL
);


ALTER TABLE public.word OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16411)
-- Name: word_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.word_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.word_id_seq OWNER TO postgres;

--
-- TOC entry 4579 (class 0 OID 0)
-- Dependencies: 222
-- Name: word_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.word_id_seq OWNED BY public.word.id;


--
-- TOC entry 223 (class 1259 OID 16412)
-- Name: word_patches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.word_patches (
    patch_id integer NOT NULL,
    word_ids json
);


ALTER TABLE public.word_patches OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16417)
-- Name: word_patches_patch_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.word_patches_patch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.word_patches_patch_id_seq OWNER TO postgres;

--
-- TOC entry 4580 (class 0 OID 0)
-- Dependencies: 224
-- Name: word_patches_patch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.word_patches_patch_id_seq OWNED BY public.word_patches.patch_id;


--
-- TOC entry 4363 (class 2604 OID 16623)
-- Name: answer_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_history ALTER COLUMN id SET DEFAULT nextval('public.answer_history_id_seq'::regclass);


--
-- TOC entry 4343 (class 2604 OID 16460)
-- Name: b2_patches patch_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.b2_patches ALTER COLUMN patch_id SET DEFAULT nextval('public.b2_patches_patch_id_seq'::regclass);


--
-- TOC entry 4344 (class 2604 OID 16469)
-- Name: c1_patches patch_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.c1_patches ALTER COLUMN patch_id SET DEFAULT nextval('public.c1_patches_patch_id_seq'::regclass);


--
-- TOC entry 4345 (class 2604 OID 16483)
-- Name: page_visit_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_visit_stats ALTER COLUMN id SET DEFAULT nextval('public.page_visit_stats_id_seq'::regclass);


--
-- TOC entry 4351 (class 2604 OID 16521)
-- Name: ranking id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking ALTER COLUMN id SET DEFAULT nextval('public.ranking_id_seq'::regclass);


--
-- TOC entry 4333 (class 2604 OID 16418)
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- TOC entry 4335 (class 2604 OID 16419)
-- Name: translation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translation ALTER COLUMN id SET DEFAULT nextval('public.translation_id_seq'::regclass);


--
-- TOC entry 4347 (class 2604 OID 16493)
-- Name: user_activity_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_stats ALTER COLUMN id SET DEFAULT nextval('public.user_activity_stats_id_seq'::regclass);


--
-- TOC entry 4355 (class 2604 OID 16543)
-- Name: user_autosave id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_autosave ALTER COLUMN id SET DEFAULT nextval('public.user_autosave_id_seq'::regclass);


--
-- TOC entry 4357 (class 2604 OID 16566)
-- Name: user_autosave version; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_autosave ALTER COLUMN version SET DEFAULT nextval('public.user_autosave_version_seq'::regclass);


--
-- TOC entry 4349 (class 2604 OID 16503)
-- Name: user_word_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_word_progress ALTER COLUMN id SET DEFAULT nextval('public.user_word_progress_id_seq'::regclass);


--
-- TOC entry 4336 (class 2604 OID 16420)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4340 (class 2604 OID 16421)
-- Name: word id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.word ALTER COLUMN id SET DEFAULT nextval('public.word_id_seq'::regclass);


--
-- TOC entry 4342 (class 2604 OID 16422)
-- Name: word_patches patch_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.word_patches ALTER COLUMN patch_id SET DEFAULT nextval('public.word_patches_patch_id_seq'::regclass);


--
-- TOC entry 4408 (class 2606 OID 16626)
-- Name: answer_history answer_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_history
    ADD CONSTRAINT answer_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4383 (class 2606 OID 16464)
-- Name: b2_patches b2_patches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.b2_patches
    ADD CONSTRAINT b2_patches_pkey PRIMARY KEY (patch_id);


--
-- TOC entry 4385 (class 2606 OID 16473)
-- Name: c1_patches c1_patches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.c1_patches
    ADD CONSTRAINT c1_patches_pkey PRIMARY KEY (patch_id);


--
-- TOC entry 4387 (class 2606 OID 16488)
-- Name: page_visit_stats page_visit_stats_page_name_stat_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_visit_stats
    ADD CONSTRAINT page_visit_stats_page_name_stat_date_key UNIQUE (page_name, stat_date);


--
-- TOC entry 4389 (class 2606 OID 16486)
-- Name: page_visit_stats page_visit_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_visit_stats
    ADD CONSTRAINT page_visit_stats_pkey PRIMARY KEY (id);


--
-- TOC entry 4406 (class 2606 OID 16613)
-- Name: arena ranking_game_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena
    ADD CONSTRAINT ranking_game_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4398 (class 2606 OID 16525)
-- Name: ranking ranking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking
    ADD CONSTRAINT ranking_pkey PRIMARY KEY (id);


--
-- TOC entry 4367 (class 2606 OID 16424)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4370 (class 2606 OID 16426)
-- Name: translation translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translation
    ADD CONSTRAINT translation_pkey PRIMARY KEY (id);


--
-- TOC entry 4400 (class 2606 OID 16533)
-- Name: ranking unique_user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking
    ADD CONSTRAINT unique_user_id UNIQUE (user_id);


--
-- TOC entry 4402 (class 2606 OID 16557)
-- Name: user_autosave unique_user_level; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_autosave
    ADD CONSTRAINT unique_user_level UNIQUE (user_id, level);


--
-- TOC entry 4391 (class 2606 OID 16498)
-- Name: user_activity_stats user_activity_stats_activity_date_activity_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_stats
    ADD CONSTRAINT user_activity_stats_activity_date_activity_type_key UNIQUE (activity_date, activity_type);


--
-- TOC entry 4393 (class 2606 OID 16496)
-- Name: user_activity_stats user_activity_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_stats
    ADD CONSTRAINT user_activity_stats_pkey PRIMARY KEY (id);


--
-- TOC entry 4404 (class 2606 OID 16548)
-- Name: user_autosave user_autosave_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_autosave
    ADD CONSTRAINT user_autosave_pkey PRIMARY KEY (id);


--
-- TOC entry 4396 (class 2606 OID 16506)
-- Name: user_word_progress user_word_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_word_progress
    ADD CONSTRAINT user_word_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 4372 (class 2606 OID 16428)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4374 (class 2606 OID 16430)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4376 (class 2606 OID 16432)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4381 (class 2606 OID 16434)
-- Name: word_patches word_patches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.word_patches
    ADD CONSTRAINT word_patches_pkey PRIMARY KEY (patch_id);


--
-- TOC entry 4379 (class 2606 OID 16436)
-- Name: word word_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.word
    ADD CONSTRAINT word_pkey PRIMARY KEY (id);


--
-- TOC entry 4368 (class 1259 OID 16638)
-- Name: idx_translation_word; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_translation_word ON public.translation USING btree (word_id);


--
-- TOC entry 4394 (class 1259 OID 16531)
-- Name: idx_user_word_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_user_word_unique ON public.user_word_progress USING btree (user_id, word_id);


--
-- TOC entry 4377 (class 1259 OID 16637)
-- Name: idx_word_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_word_level ON public.word USING btree (level);


--
-- TOC entry 4417 (class 2606 OID 16627)
-- Name: answer_history answer_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_history
    ADD CONSTRAINT answer_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4418 (class 2606 OID 16632)
-- Name: answer_history answer_history_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_history
    ADD CONSTRAINT answer_history_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.word(id);


--
-- TOC entry 4416 (class 2606 OID 16614)
-- Name: arena ranking_game_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena
    ADD CONSTRAINT ranking_game_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4414 (class 2606 OID 16526)
-- Name: ranking ranking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking
    ADD CONSTRAINT ranking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4409 (class 2606 OID 16437)
-- Name: reports reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4410 (class 2606 OID 16442)
-- Name: reports reports_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.word(id);


--
-- TOC entry 4411 (class 2606 OID 16447)
-- Name: translation translation_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translation
    ADD CONSTRAINT translation_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.word(id);


--
-- TOC entry 4415 (class 2606 OID 16549)
-- Name: user_autosave user_autosave_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_autosave
    ADD CONSTRAINT user_autosave_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4412 (class 2606 OID 16507)
-- Name: user_word_progress user_word_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_word_progress
    ADD CONSTRAINT user_word_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4413 (class 2606 OID 16512)
-- Name: user_word_progress user_word_progress_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_word_progress
    ADD CONSTRAINT user_word_progress_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.word(id);


-- Completed on 2025-05-06 16:33:54 CEST

--
-- PostgreSQL database dump complete
--

