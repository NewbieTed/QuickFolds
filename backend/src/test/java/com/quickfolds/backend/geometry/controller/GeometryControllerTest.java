package com.quickfolds.backend.geometry.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.model.dto.*;
import com.quickfolds.backend.geometry.service.GeometryService;
import com.quickfolds.backend.user.auth.JwtAuthenticationFilter;
import lombok.Data;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for {@link GeometryController}.
 * <p>
 * This test class verifies the behavior of the GeometryController endpoints using
 * MockMvc to simulate HTTP requests. It mocks the {@link GeometryService} to isolate
 * controller logic and ensure correct request handling.
 * <p>
 * Key functionalities tested:
 * <ul>
 *     <li>Valid annotation request processing.</li>
 *     <li>Handling of invalid requests (missing parameters).</li>
 *     <li>JSON serialization and deserialization using {@link ObjectMapper}.</li>
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
@WebMvcTest(controllers = GeometryController.class)
@AutoConfigureMockMvc(addFilters = false)
public class GeometryControllerTest {

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
     * Mocked GeometryService to isolate controller behavior.
     */
    @MockBean
    private GeometryService geometryService;

    /**
     * ObjectMapper for JSON serialization and deserialization.
     */
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Factory method for creating an {@link AnnotationRequest} with specified parameters.
     * <p>
     * This method simplifies test setup by generating requests with custom point and line annotations,
     * as well as deleted IDs for testing removal operations.
     *
     * @param origamiId      The ID of the origami model.
     * @param stepIdInOrigami The step identifier within the origami process.
     * @param points         List of point annotations.
     * @param lines          List of line annotations.
     * @param deletedPoints  List of deleted point IDs.
     * @param deletedLines   List of deleted line IDs.
     * @return An {@link AnnotationRequest} object with the specified parameters.
     */
    public static AnnotationRequest createAnnotationRequest(Long origamiId, Integer stepIdInOrigami,
                                                            List<PointAnnotationRequest> points,
                                                            List<LineAnnotationRequest> lines,
                                                            List<Integer> deletedPoints,
                                                            List<Integer> deletedLines) {
        Annotation annotation = new Annotation(points, lines, deletedPoints, deletedLines);
        FaceAnnotateRequest face = new FaceAnnotateRequest(5, annotation);
        return new AnnotationRequest(origamiId, stepIdInOrigami, Collections.singletonList(face));
    }

    /**
     * Tests that a valid annotation request is processed successfully.
     * <p>
     * This test mocks the {@link GeometryService#annotate} method to return a successful response.
     * It sends a valid {@code POST} request to {@code /geometry/annotate} and expects an HTTP 200 OK response.
     *
     * @throws Exception if the request cannot be processed.
     */
    @Test
    public void handlesValidAnnotateRequest() throws Exception {
        Mockito.when(geometryService.annotate(Mockito.any(AnnotationRequest.class), Mockito.isNull()))
                .thenReturn(BaseResponse.success(true));

        List<PointAnnotationRequest> points = new ArrayList<>();
        List<LineAnnotationRequest> lines = new ArrayList<>();
        List<Integer> deletedPoints = new ArrayList<>();
        List<Integer> deletedLines = new ArrayList<>();

        for (int i = 1; i <= 3; i++) {
            points.add(new PointAnnotationRequest(i, 1.0 * i, 1.0 * i, null));
            lines.add(new LineAnnotationRequest(i, i, i + 1));
            deletedPoints.add(2 * i);
            deletedLines.add(2 * i);
        }

        AnnotationRequest request = createAnnotationRequest(1L, 2, points, lines, deletedPoints, deletedLines);
        String requestBody = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/geometry/annotate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    /**
     * Tests that a request missing {@code origamiId} is rejected with an HTTP 400 Bad Request.
     * <p>
     * This test creates an annotation request with a {@code null} {@code origamiId},
     * sends it to the endpoint, and expects a 400 status code as a response.
     *
     * @throws Exception if the request cannot be processed.
     */
    @Test
    public void handlesInvalidAnnotateRequest_MissingOrigamiId() throws Exception {
        List<PointAnnotationRequest> points = new ArrayList<>();
        List<LineAnnotationRequest> lines = new ArrayList<>();
        List<Integer> deletedPoints = new ArrayList<>();
        List<Integer> deletedLines = new ArrayList<>();

        for (int i = 1; i <= 3; i++) {
            points.add(new PointAnnotationRequest(i, 1.0 * i, 1.0 * i, null));
            lines.add(new LineAnnotationRequest(i, i, i + 1));
            deletedPoints.add(2 * i);
            deletedLines.add(2 * i);
        }

        AnnotationRequest invalidRequest = createAnnotationRequest(null, 2, points, lines, deletedPoints, deletedLines);
        String requestBody = objectMapper.writeValueAsString(invalidRequest);

        mockMvc.perform(post("/geometry/annotate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }
}