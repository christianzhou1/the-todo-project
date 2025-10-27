package com.todo.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.Ssl;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class SslConfig {

    @Bean
    @Profile("ssl")
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> sslCustomizer() {
        return factory -> {
            Ssl ssl = new Ssl();
            ssl.setEnabled(true);
            ssl.setKeyStore("classpath:keystore.p12");
            ssl.setKeyStorePassword("changeit");
            ssl.setKeyStoreType("PKCS12");
            ssl.setKeyAlias("tomcat");
            factory.setSsl(ssl);
        };
    }
}
