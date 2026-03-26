-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-03-2026 a las 06:05:21
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `superbarbaro`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `imagen` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `imagen`) VALUES
(1, 'hamburguesas', ''),
(2, 'perros', ''),
(3, 'arepas', ''),
(4, 'chuzos', ''),
(5, 'sandwichs', ''),
(6, 'chorizos', ''),
(7, 'bebidas', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `menu`
--

INSERT INTO `menu` (`id`, `nombre`, `descripcion`, `precio`, `categoria_id`, `imagen`, `fecha_creacion`) VALUES
(1, 'americano', NULL, 10500.00, 2, NULL, '2026-03-26 03:51:28'),
(2, 'street', NULL, 14000.00, 2, NULL, '2026-03-26 03:51:28'),
(3, 'odin', NULL, 16000.00, 2, NULL, '2026-03-26 03:51:28'),
(4, 'perras', NULL, 15000.00, 2, NULL, '2026-03-26 03:51:28'),
(5, 'valkiria', NULL, 16000.00, 2, NULL, '2026-03-26 03:51:28'),
(6, 'hawaiano', NULL, 15000.00, 2, NULL, '2026-03-26 03:51:28'),
(7, 'asgard', NULL, 16000.00, 2, NULL, '2026-03-26 03:51:28'),
(8, 'pollo', NULL, 17000.00, 2, NULL, '2026-03-26 03:51:28'),
(9, 'carne', NULL, 18000.00, 2, NULL, '2026-03-26 03:51:28'),
(10, 'americana', NULL, 12500.00, 1, NULL, '2026-03-26 03:51:28'),
(11, 'street', NULL, 17000.00, 1, NULL, '2026-03-26 03:51:28'),
(12, 'thor', NULL, 18000.00, 1, NULL, '2026-03-26 03:51:28'),
(13, 'freya', NULL, 16000.00, 1, NULL, '2026-03-26 03:51:28'),
(14, 'hawaiana', NULL, 17000.00, 1, NULL, '2026-03-26 03:51:28'),
(15, 'asgard', NULL, 21000.00, 1, NULL, '2026-03-26 03:51:28'),
(16, 'doble freya', NULL, 22000.00, 1, NULL, '2026-03-26 03:51:28'),
(17, 'doble sabor', NULL, 22000.00, 1, NULL, '2026-03-26 03:51:28'),
(18, 'loki', NULL, 22000.00, 1, NULL, '2026-03-26 03:51:28'),
(19, 'apolo', NULL, 23000.00, 1, NULL, '2026-03-26 03:51:28'),
(20, 'loconcha pollo', NULL, 16000.00, 1, NULL, '2026-03-26 03:51:28'),
(21, 'loconcha carne', NULL, 17000.00, 1, NULL, '2026-03-26 03:51:28'),
(22, 'fenrir', NULL, 28000.00, 1, NULL, '2026-03-26 03:51:28'),
(23, 'chorizo', NULL, 12000.00, 6, NULL, '2026-03-26 03:51:28'),
(24, 'panchorizo', NULL, 12000.00, 6, NULL, '2026-03-26 03:51:28'),
(25, 'choripan', NULL, 12000.00, 6, NULL, '2026-03-26 03:51:28'),
(26, 'pollo', NULL, 16000.00, 4, NULL, '2026-03-26 03:51:28'),
(27, 'cerdo', NULL, 16000.00, 4, NULL, '2026-03-26 03:51:28'),
(28, 'pollo bbq', NULL, 17000.00, 4, NULL, '2026-03-26 03:51:28'),
(29, 'cerdo bbq', NULL, 17000.00, 4, NULL, '2026-03-26 03:51:28'),
(30, 'pollo gratinado', NULL, 18000.00, 4, NULL, '2026-03-26 03:51:28'),
(31, 'cerdo gratinado', NULL, 18000.00, 4, NULL, '2026-03-26 03:51:28'),
(32, 'vegetariano', NULL, 12000.00, 5, NULL, '2026-03-26 03:51:28'),
(33, 'tradicional', NULL, 15000.00, 5, NULL, '2026-03-26 03:51:28'),
(34, 'cubano', NULL, 16000.00, 5, NULL, '2026-03-26 03:51:28'),
(35, 'cordero', NULL, 17000.00, 5, NULL, '2026-03-26 03:51:28'),
(36, 'pollo', NULL, 16000.00, 5, NULL, '2026-03-26 03:51:28'),
(37, 'pollo bbq', NULL, 17000.00, 5, NULL, '2026-03-26 03:51:28'),
(38, 'ropa vieja', NULL, 18000.00, 5, NULL, '2026-03-26 03:51:28'),
(39, 'del campo', NULL, 18000.00, 5, NULL, '2026-03-26 03:51:28'),
(40, 'valhalla', NULL, 24000.00, 5, NULL, '2026-03-26 03:51:28'),
(41, 'hawaiano', NULL, 14000.00, 5, NULL, '2026-03-26 03:51:28'),
(42, 'sven', NULL, 22000.00, 5, NULL, '2026-03-26 03:51:28'),
(43, 'frigg', NULL, 20000.00, 5, NULL, '2026-03-26 03:51:28'),
(44, 'gungnir', NULL, 18000.00, 5, NULL, '2026-03-26 03:51:28'),
(45, 'nordico', NULL, 22000.00, 5, NULL, '2026-03-26 03:51:28'),
(46, 'solita', NULL, 1500.00, 3, NULL, '2026-03-26 03:51:28'),
(47, 'con queso', NULL, 3000.00, 3, NULL, '2026-03-26 03:51:28'),
(48, 'hawaiana', NULL, 10000.00, 3, NULL, '2026-03-26 03:51:28'),
(49, 'balder', NULL, 9000.00, 3, NULL, '2026-03-26 03:51:28'),
(50, 'frigg', NULL, 10000.00, 3, NULL, '2026-03-26 03:51:28'),
(51, 'street', NULL, 16000.00, 3, NULL, '2026-03-26 03:51:28'),
(52, 'freya', NULL, 16000.00, 3, NULL, '2026-03-26 03:51:28'),
(53, 'sven', NULL, 9000.00, 3, NULL, '2026-03-26 03:51:28'),
(54, 'olaf', NULL, 10000.00, 3, NULL, '2026-03-26 03:51:28'),
(55, 'loconcha pollo', NULL, 16000.00, 3, NULL, '2026-03-26 03:51:28'),
(56, 'loconcha carne', NULL, 17000.00, 3, NULL, '2026-03-26 03:51:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_productos`
--

CREATE TABLE `menu_productos` (
  `id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `menu_productos`
--

INSERT INTO `menu_productos` (`id`, `menu_id`, `producto_id`, `cantidad`) VALUES
(1, 1, 1, 1.00),
(2, 1, 4, 1.00),
(3, 1, 10, 1.00),
(4, 1, 26, 1.00),
(5, 1, 27, 1.00),
(8, 2, 1, 1.00),
(9, 2, 4, 1.00),
(10, 2, 10, 1.00),
(11, 2, 11, 1.00),
(12, 2, 12, 1.00),
(15, 3, 1, 1.00),
(16, 3, 5, 1.00),
(17, 3, 10, 1.00),
(18, 3, 11, 1.00),
(19, 3, 12, 1.00),
(22, 4, 1, 1.00),
(23, 4, 10, 1.00),
(24, 4, 11, 1.00),
(25, 4, 12, 1.00),
(29, 5, 1, 1.00),
(30, 5, 4, 1.00),
(31, 5, 10, 1.00),
(32, 5, 11, 1.00),
(33, 5, 12, 1.00),
(34, 5, 13, 1.00),
(36, 6, 1, 1.00),
(37, 6, 4, 1.00),
(38, 6, 10, 1.00),
(39, 6, 11, 1.00),
(40, 6, 12, 1.00),
(41, 6, 14, 1.00),
(43, 7, 1, 1.00),
(44, 7, 4, 1.00),
(45, 7, 10, 1.00),
(46, 7, 11, 1.00),
(47, 7, 16, 1.00),
(48, 7, 17, 1.00),
(50, 8, 1, 1.00),
(51, 8, 4, 1.00),
(52, 8, 8, 1.00),
(53, 8, 11, 1.00),
(54, 8, 12, 1.00),
(57, 9, 1, 1.00),
(58, 9, 4, 1.00),
(59, 9, 7, 1.00),
(60, 9, 11, 1.00),
(61, 9, 12, 1.00),
(64, 10, 2, 1.00),
(65, 10, 6, 1.00),
(66, 10, 10, 1.00),
(67, 10, 18, 1.00),
(68, 10, 26, 1.00),
(69, 10, 27, 1.00),
(71, 11, 2, 1.00),
(72, 11, 10, 1.00),
(73, 11, 11, 1.00),
(74, 11, 12, 1.00),
(75, 11, 18, 1.00),
(76, 11, 19, 1.00),
(78, 12, 2, 1.00),
(79, 12, 5, 1.00),
(80, 12, 10, 1.00),
(81, 12, 11, 1.00),
(82, 12, 12, 1.00),
(83, 12, 18, 1.00),
(84, 12, 19, 1.00),
(85, 13, 2, 1.00),
(86, 13, 9, 1.00),
(87, 13, 10, 1.00),
(88, 13, 11, 1.00),
(89, 13, 12, 1.00),
(90, 13, 18, 1.00),
(91, 13, 19, 1.00),
(92, 14, 2, 1.00),
(93, 14, 10, 1.00),
(94, 14, 11, 1.00),
(95, 14, 15, 1.00),
(99, 15, 2, 1.00),
(100, 15, 11, 1.00),
(101, 15, 16, 1.00),
(102, 15, 17, 1.00),
(103, 15, 18, 1.00),
(104, 15, 19, 1.00),
(106, 16, 2, 1.00),
(107, 16, 9, 1.00),
(108, 16, 10, 1.00),
(109, 16, 11, 1.00),
(110, 16, 12, 1.00),
(111, 16, 18, 1.00),
(112, 16, 19, 1.00),
(113, 17, 2, 1.00),
(114, 17, 10, 1.00),
(115, 17, 11, 1.00),
(116, 17, 12, 1.00),
(117, 17, 18, 1.00),
(118, 17, 19, 1.00),
(120, 18, 2, 1.00),
(121, 18, 9, 1.00),
(122, 18, 10, 1.00),
(123, 18, 11, 1.00),
(124, 18, 12, 1.00),
(125, 18, 18, 1.00),
(126, 18, 19, 1.00),
(127, 19, 2, 1.00),
(128, 19, 5, 1.00),
(129, 19, 10, 1.00),
(130, 19, 11, 1.00),
(131, 19, 12, 1.00),
(132, 19, 18, 1.00),
(133, 19, 19, 1.00),
(134, 20, 2, 1.00),
(135, 20, 8, 1.00),
(136, 20, 10, 1.00),
(137, 20, 11, 1.00),
(138, 20, 12, 1.00),
(139, 20, 18, 1.00),
(140, 20, 19, 1.00),
(141, 21, 2, 1.00),
(142, 21, 7, 1.00),
(143, 21, 10, 1.00),
(144, 21, 11, 1.00),
(145, 21, 12, 1.00),
(146, 21, 18, 1.00),
(147, 21, 19, 1.00),
(148, 22, 2, 1.00),
(149, 22, 5, 1.00),
(150, 22, 9, 1.00),
(151, 22, 11, 1.00),
(152, 22, 12, 1.00),
(153, 22, 19, 1.00),
(155, 23, 5, 1.00),
(156, 23, 10, 1.00),
(157, 23, 24, 1.00),
(158, 24, 3, 1.00),
(159, 24, 5, 1.00),
(161, 25, 3, 1.00),
(162, 25, 5, 1.00),
(164, 26, 8, 1.00),
(165, 26, 10, 1.00),
(166, 26, 24, 1.00),
(167, 26, 25, 1.00),
(171, 27, 10, 1.00),
(172, 27, 24, 1.00),
(173, 27, 25, 1.00),
(174, 28, 8, 1.00),
(175, 28, 10, 1.00),
(176, 28, 24, 1.00),
(177, 28, 25, 1.00),
(178, 28, 28, 1.00),
(181, 29, 10, 1.00),
(182, 29, 24, 1.00),
(183, 29, 25, 1.00),
(184, 29, 28, 1.00),
(188, 30, 8, 1.00),
(189, 30, 10, 1.00),
(190, 30, 24, 1.00),
(191, 30, 25, 1.00),
(195, 31, 10, 1.00),
(196, 31, 24, 1.00),
(197, 31, 25, 1.00),
(198, 32, 3, 1.00),
(199, 32, 10, 1.00),
(200, 32, 13, 1.00),
(201, 32, 18, 1.00),
(202, 32, 20, 1.00),
(203, 32, 29, 1.00),
(205, 33, 3, 1.00),
(206, 33, 10, 1.00),
(207, 33, 18, 1.00),
(208, 33, 20, 1.00),
(209, 33, 21, 1.00),
(210, 33, 22, 1.00),
(211, 33, 29, 1.00),
(212, 34, 3, 1.00),
(213, 34, 10, 1.00),
(214, 34, 18, 1.00),
(215, 34, 20, 1.00),
(216, 34, 21, 1.00),
(217, 34, 29, 1.00),
(219, 35, 3, 1.00),
(220, 35, 10, 1.00),
(221, 35, 18, 1.00),
(222, 35, 20, 1.00),
(223, 35, 21, 1.00),
(224, 35, 29, 1.00),
(226, 36, 3, 1.00),
(227, 36, 8, 1.00),
(228, 36, 10, 1.00),
(229, 36, 18, 1.00),
(230, 36, 20, 1.00),
(231, 36, 29, 1.00),
(233, 37, 3, 1.00),
(234, 37, 8, 1.00),
(235, 37, 10, 1.00),
(236, 37, 18, 1.00),
(237, 37, 20, 1.00),
(238, 37, 28, 1.00),
(240, 38, 3, 1.00),
(241, 38, 7, 1.00),
(242, 38, 10, 1.00),
(243, 38, 18, 1.00),
(244, 38, 20, 1.00),
(245, 38, 29, 1.00),
(247, 39, 3, 1.00),
(248, 39, 10, 1.00),
(249, 39, 11, 1.00),
(250, 39, 13, 1.00),
(251, 39, 18, 1.00),
(252, 39, 20, 1.00),
(253, 39, 29, 1.00),
(254, 40, 3, 1.00),
(255, 40, 6, 1.00),
(256, 40, 10, 1.00),
(257, 40, 11, 1.00),
(258, 40, 18, 1.00),
(259, 40, 20, 1.00),
(260, 40, 29, 1.00),
(261, 41, 3, 1.00),
(262, 41, 10, 1.00),
(263, 41, 14, 1.00),
(264, 41, 21, 1.00),
(268, 42, 3, 1.00),
(269, 42, 8, 1.00),
(270, 42, 10, 1.00),
(271, 42, 11, 1.00),
(272, 42, 14, 1.00),
(273, 42, 29, 1.00),
(275, 43, 3, 1.00),
(276, 43, 9, 1.00),
(277, 43, 10, 1.00),
(278, 43, 18, 1.00),
(279, 43, 20, 1.00),
(280, 43, 29, 1.00),
(282, 44, 3, 1.00),
(283, 44, 5, 1.00),
(284, 44, 10, 1.00),
(285, 44, 16, 1.00),
(286, 44, 18, 1.00),
(287, 44, 20, 1.00),
(288, 44, 29, 1.00),
(289, 45, 3, 1.00),
(290, 45, 7, 1.00),
(291, 45, 8, 1.00),
(292, 45, 10, 1.00),
(293, 45, 18, 1.00),
(294, 45, 20, 1.00),
(295, 45, 29, 1.00),
(296, 46, 24, 1.00),
(297, 47, 10, 1.00),
(298, 47, 24, 1.00),
(300, 48, 10, 1.00),
(301, 48, 14, 1.00),
(302, 48, 21, 1.00),
(303, 48, 24, 1.00),
(307, 49, 6, 1.00),
(308, 49, 10, 1.00),
(309, 49, 24, 1.00),
(310, 50, 9, 1.00),
(311, 50, 10, 1.00),
(312, 50, 24, 1.00),
(313, 51, 6, 1.00),
(314, 51, 11, 1.00),
(315, 51, 12, 1.00),
(316, 51, 18, 1.00),
(317, 51, 19, 1.00),
(318, 51, 24, 1.00),
(320, 52, 9, 1.00),
(321, 52, 11, 1.00),
(322, 52, 12, 1.00),
(323, 52, 18, 1.00),
(324, 52, 19, 1.00),
(325, 52, 24, 1.00),
(327, 53, 8, 1.00),
(328, 53, 10, 1.00),
(329, 53, 24, 1.00),
(330, 54, 7, 1.00),
(331, 54, 10, 1.00),
(332, 54, 24, 1.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_productos`
--

CREATE TABLE `movimientos_productos` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `tipo` enum('ENTRADA','SALIDA') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_productos`
--

INSERT INTO `movimientos_productos` (`id`, `producto_id`, `tipo`, `cantidad`, `motivo`, `fecha`) VALUES
(11, 2, 'ENTRADA', 50, 'Edición manual', '2026-03-26 03:33:41'),
(12, 2, 'SALIDA', 40, 'Edición manual', '2026-03-26 03:33:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `imagen` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `categoria_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `precio`, `cantidad`, `imagen`, `fecha_creacion`, `categoria_id`) VALUES
(1, 'Pan de perro', 500.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(2, 'Pan de hamburguesa', 500.00, 110, NULL, '2026-03-26 03:25:36', NULL),
(3, 'Pan francés', 700.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(4, 'Salchicha', 2000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(5, 'Chorizo de cerdo', 4000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(6, 'Carne de hamburguesa', 5000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(7, 'Carne desmechada', 6000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(8, 'Pollo desmechado', 5000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(9, 'Filete de pollo', 6000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(10, 'Queso', 800.00, 200, NULL, '2026-03-26 03:25:36', NULL),
(11, 'Tocineta', 1500.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(12, 'Ripio', 300.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(13, 'Maicitos', 1000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(14, 'Piña calada', 2000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(15, 'Piña asada', 2000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(16, 'Maduro', 1500.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(17, 'Chicharrón', 2000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(18, 'Tomate', 500.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(19, 'Cebolla', 500.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(20, 'Lechuga', 500.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(21, 'Jamón', 2000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(22, 'Salami', 2500.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(23, 'Cordero', 4000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(24, 'Arepa', 1000.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(25, 'Ensalada', 1500.00, 100, NULL, '2026-03-26 03:25:36', NULL),
(26, 'Salsa tomate', 300.00, 200, NULL, '2026-03-26 03:25:36', NULL),
(27, 'Salsa mostaza', 300.00, 200, NULL, '2026-03-26 03:25:36', NULL),
(28, 'Salsa BBQ', 500.00, 200, NULL, '2026-03-26 03:25:36', NULL),
(29, 'Salsa de ajo', 500.00, 200, NULL, '2026-03-26 03:25:36', NULL),
(30, 'Salsa barbara', 500.00, 200, NULL, '2026-03-26 03:25:36', NULL),
(31, 'Salsa piña', 500.00, 200, NULL, '2026-03-26 03:25:36', NULL),
(32, 'Salsa verde', 500.00, 200, NULL, '2026-03-26 03:25:36', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_categoria`
--

CREATE TABLE `producto_categoria` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_categoria`
--

INSERT INTO `producto_categoria` (`id`, `producto_id`, `categoria_id`) VALUES
(47, 1, 2),
(16, 2, 1),
(76, 3, 5),
(62, 3, 6),
(48, 4, 2),
(17, 5, 1),
(49, 5, 2),
(77, 5, 5),
(63, 5, 6),
(18, 6, 1),
(107, 6, 3),
(78, 6, 5),
(19, 7, 1),
(50, 7, 2),
(108, 7, 3),
(79, 7, 5),
(20, 8, 1),
(51, 8, 2),
(109, 8, 3),
(69, 8, 4),
(80, 8, 5),
(21, 9, 1),
(110, 9, 3),
(81, 9, 5),
(22, 10, 1),
(52, 10, 2),
(111, 10, 3),
(70, 10, 4),
(82, 10, 5),
(64, 10, 6),
(23, 11, 1),
(53, 11, 2),
(112, 11, 3),
(83, 11, 5),
(24, 12, 1),
(54, 12, 2),
(113, 12, 3),
(55, 13, 2),
(84, 13, 5),
(56, 14, 2),
(114, 14, 3),
(85, 14, 5),
(25, 15, 1),
(26, 16, 1),
(57, 16, 2),
(86, 16, 5),
(27, 17, 1),
(58, 17, 2),
(28, 18, 1),
(115, 18, 3),
(87, 18, 5),
(29, 19, 1),
(116, 19, 3),
(88, 19, 5),
(89, 20, 5),
(117, 21, 3),
(90, 21, 5),
(91, 22, 5),
(92, 23, 5),
(118, 24, 3),
(71, 24, 4),
(65, 24, 6),
(72, 25, 4),
(30, 26, 1),
(59, 26, 2),
(31, 27, 1),
(60, 27, 2),
(119, 28, 3),
(93, 28, 5),
(120, 29, 3),
(94, 29, 5),
(32, 30, 1),
(121, 31, 3),
(122, 32, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` varchar(20) NOT NULL DEFAULT 'usuario',
  `foto` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `codigo`, `password`, `nombre`, `apellido`, `cedula`, `direccion`, `correo`, `telefono`, `rol`, `foto`, `fecha_creacion`) VALUES
(1, 'admin', '1234', 'Administrador', '', '1111111111', 'Cl 47 #120-103', 'administrador@gmail.com', '3333333333', 'Administrador', NULL, '2026-03-13 21:12:51'),
(2, 'cocinero1', '1234', 'Miguel', 'Reyes', '1222222222', 'Cl. 50 #101-60', 'miguelreyes@gmail.com', '3222222222', 'COCINERO', NULL, '2026-03-13 21:15:35'),
(3, 'cajero1', '1234', 'Michael', 'Moreno', '1111661861', 'Cra. 1c #63-29', 'michaelmoreno@gmail.com', '3122222222', 'CAJERO', NULL, '2026-03-14 00:06:03'),
(4, 'cocinero2', '1234', 'Valeria', 'Espinosa', '11111155', 'Cra. 1c #63-29', 'cocinero@gmail.com', '3145555555', 'COCINERO', NULL, '2026-03-14 01:31:28');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `menu_productos`
--
ALTER TABLE `menu_productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `menu_id` (`menu_id`,`producto_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `movimientos_productos`
--
ALTER TABLE `movimientos_productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `producto_categoria`
--
ALTER TABLE `producto_categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `producto_id` (`producto_id`,`categoria_id`),
  ADD UNIQUE KEY `producto_id_2` (`producto_id`,`categoria_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `menu_productos`
--
ALTER TABLE `menu_productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=333;

--
-- AUTO_INCREMENT de la tabla `movimientos_productos`
--
ALTER TABLE `movimientos_productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `producto_categoria`
--
ALTER TABLE `producto_categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `menu_productos`
--
ALTER TABLE `menu_productos`
  ADD CONSTRAINT `menu_productos_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_productos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `movimientos_productos`
--
ALTER TABLE `movimientos_productos`
  ADD CONSTRAINT `movimientos_productos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto_categoria`
--
ALTER TABLE `producto_categoria`
  ADD CONSTRAINT `producto_categoria_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_categoria_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
