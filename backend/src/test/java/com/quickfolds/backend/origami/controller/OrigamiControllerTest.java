package com.quickfolds.backend.origami.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.origami.service.OrigamiService;
import com.quickfolds.backend.user.auth.JwtAuthenticationFilter;
import lombok.Data;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for {@link OrigamiController}.
 * <p>
 * This test class verifies the behavior of the OrigamiController endpoints using
 * MockMvc to simulate HTTP requests. It mocks the {@link OrigamiService} to isolate
 * controller logic and ensure correct request handling.
 * <p>
 * Key functionalities tested:
 * <ul>
 *     <li>Valid origami list retrieval request.</li>
 *     <li>Mocking of service layer using {@link Mockito}.</li>
 *     <li>Simulated GET request using {@link MockMvc}.</li>
 * </ul>
 *
 * Dependencies:
 * <ul>
 *     <li>{@link MockMvc}: Simulates HTTP requests and responses.</li>
 *     <li>{@link Mockito}: Mocks service layer behavior.</li>
 *     <li>{@link ObjectMapper}: Converts Java objects to JSON.</li>
 * </ul>
 */
@Data
@WebMvcTest(controllers = OrigamiController.class)
@AutoConfigureMockMvc(addFilters = false)
public class OrigamiControllerTest {

    /**
     * MockMvc instance for simulating HTTP requests and responses.
     * <p>
     * This bean is automatically configured by {@code @WebMvcTest} to test only the web layer.
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * Mocked JWT authentication filter.
     * <p>
     * This filter is disabled in tests using {@code @AutoConfigureMockMvc(addFilters = false)}.
     */
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Mocked OrigamiService to isolate controller behavior.
     */
    @MockBean
    private OrigamiService origamiService;

    /**
     * Tests that a valid request to fetch the origami list is processed successfully.
     * <p>
     * This test mocks the {@link OrigamiService#list()} method to return a successful response.
     * It sends a valid {@code GET} request to {@code /origami/list} and expects an HTTP 200 OK response.
     *
     * @throws Exception if the request cannot be processed.
     */
    @Test
    public void handlesValidRequest() throws Exception {

        // Mocking service response
        Mockito.when(origamiService.list())
                .thenReturn(BaseResponse.success(null));

        // Performing GET request and asserting response status
        mockMvc.perform(get("/origami/list"))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType("application/json"))
                .andExpect(jsonPath("$.status").value(true))
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.message").value("success"));
    }
}