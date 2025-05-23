package com.tripPlanner.project.commons;


import com.tripPlanner.project.domain.login.auth.handler.CustomLogoutHandler;
import com.tripPlanner.project.domain.login.auth.handler.Oauth2LoginSuccessHandler;
import com.tripPlanner.project.domain.login.auth.jwt.JwtAuthenticationFilter;
import com.tripPlanner.project.domain.login.auth.jwt.JwtTokenProvider;
import com.tripPlanner.project.domain.login.service.AuthService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final Oauth2LoginSuccessHandler oauth2LoginSuccessHandler;
    private final RedisTemplate<String, String> redisTemplate;
    private final AuthService authService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.httpBasic(AbstractHttpConfigurer::disable);
        // 폼로그인 비활성화 (jwt사용하기 위해)
        http.formLogin(AbstractHttpConfigurer::disable);
        http.csrf(AbstractHttpConfigurer::disable);
        //CORS 설정 활성화
//        http.cors((config) -> {
//            corsConfigurationSource();
//        });
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // 정적 경로
        http.authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login", "/oauth2/**","/join", "/", "/board","**", "/**", "/api/search").permitAll() // 인증 없이 허용할 경로
                        .requestMatchers("/css/**", "/js/**", "image/**", "/favicon.ico").permitAll() //정적 자원 허용
                        .requestMatchers("/upload/**").permitAll()
                        .requestMatchers("/api/user/**","/makePlanner","/user/mypage/**/**","/listDestination" ).hasRole("USER") //user 권한만 접근할 수 있는 경로
                        .requestMatchers("/api/admin/**").hasRole("ADMIN") //user 권한만 접근할 수 있는 경로
                        .requestMatchers("/logout", "/admin",

                                "/travelcourse", "/travelcourse-info", "/tourist", "/tourist-info").authenticated()  // 인증 없으면 허용하지 않을 경로
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(sessionRemoveFilter(), BasicAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter(), LogoutFilter.class);


        http.logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login")
                .invalidateHttpSession(true) //세션 무효화
                .deleteCookies("accessToken", "MY_SESSION") //쿠키 삭제
                .addLogoutHandler(new CustomLogoutHandler(redisTemplate,authService))
                .clearAuthentication(true)
        );

        //Remember Me 설정
        http.rememberMe((rm) -> {
            rm.rememberMeParameter("remember-me");
            rm.alwaysRemember(false);
            rm.tokenValiditySeconds(30 * 30);
        });

        //소셜 로그인 (입맛에 맞춰 쓰면 됩니다)
        http.oauth2Login(oauth2 -> oauth2
                .loginPage("/user/login")
                .successHandler(oauth2LoginSuccessHandler)
                .failureUrl("/login?error=true")
        );

        return http.build();
    }
  
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider,redisTemplate,authService);
    }



    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    //CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.addAllowedOrigin("http://localhost:3000"); //리액트 url 허용
        configuration.addAllowedOrigin("http://localhost:9000"); //리액트 url 허용
        configuration.addAllowedMethod("*"); //모든 HTTP 메서드 허용 / 추후 수정
        configuration.addAllowedHeader("*"); //모든 헤더 허용 /추후 수정
        configuration.setAllowCredentials(true); //자격 증명 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    Filter sessionRemoveFilter() throws Exception {

        return new Filter() {

            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException, IOException {

                if (response instanceof HttpServletResponse) {
                    HttpServletResponse resp = (HttpServletResponse) response;
                    resp.setHeader("Set-Cookie", "SESSION=; Path=/; Max-Age=0; HttpOnly");
                }
                chain.doFilter(request, response);
            }
        };
    }


}