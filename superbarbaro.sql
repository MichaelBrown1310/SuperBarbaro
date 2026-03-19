-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-03-2026 a las 03:10:31
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
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
