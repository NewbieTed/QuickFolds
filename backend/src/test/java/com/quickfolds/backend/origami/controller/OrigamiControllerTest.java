package com.quickfolds.backend.origami.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.model.dto.*;
import com.quickfolds.backend.origami.service.OrigamiService;
import com.quickfolds.backend.user.auth.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for `OrigamiController`.
 *
 * - Uses `@WebMvcTest` to test only the controller layer.
 * - Mocks `OrigamiService` to isolate controller logic.
 * - Tests API responses for valid origami requests.
 *
 * Dependencies:
 * - `MockMvc` for simulating HTTP requests.
 * - `Mockito` for mocking service behavior.
 */
@WebMvcTest(controllers = OrigamiController.class)
@AutoConfigureMockMvc(addFilters = false)
public class OrigamiControllerTest {
    /**
     * MockMvc instance for simulating HTTP requests.
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * Mocked JWT authentication filter.
     *
     * - Disabled in tests using `@AutoConfigureMockMvc(addFilters = false)`.
     */
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Mocked `OrigamiService` to isolate controller behavior.
     */
    @MockBean
    private OrigamiService origamiService;

    /**
     * Tests that a valid request to fetch the origami list is processed successfully.
     *
     * - Mocks `origamiService.list()` to return a successful response.
     * - Sends a `GET` request to `/origami/list`.
     * - Expects `HTTP 200 OK` response.
     */
    @Test
    public void handlesValidRequest() throws Exception {

        List<Long> id = new ArrayList<>();

        // Mocking service response
        Mockito.when(origamiService.list())
                .thenReturn(BaseResponse.success(null));

        // Performing GET request and asserting response status
        mockMvc.perform(get("/origami/list"))
                .andExpect(status().isOk());
    }
}