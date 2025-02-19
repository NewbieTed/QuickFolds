package com.quickfolds.backend.geometry.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.model.dto.*;
import com.quickfolds.backend.geometry.service.GeometryService;
import com.quickfolds.backend.user.auth.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for `GeometryController`.
 *
 * - Uses `@WebMvcTest` to test only the controller layer.
 * - Mocks `GeometryService` to isolate controller logic.
 * - Tests various annotation request scenarios including valid and invalid cases.
 *
 * Dependencies:
 * - `MockMvc` for simulating HTTP requests.
 * - `ObjectMapper` for JSON serialization.
 * - `Mockito` for service mocking.
 */
@WebMvcTest(controllers = GeometryController.class)
@AutoConfigureMockMvc(addFilters = false)
public class GeometryControllerTest {
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
     * Mocked `GeometryService` to isolate controller behavior.
     */
    @MockBean
    private GeometryService geometryService;

    /**
     * ObjectMapper for converting Java objects to JSON.
     */
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Factory method for creating an `AnnotationRequest` with specified parameters.
     *
     * @param origamiId The ID of the origami model.
     * @param stepIdInOrigami The step identifier within the origami.
     * @param points List of point annotations.
     * @param lines List of line annotations.
     * @param deletedPoints List of deleted point IDs.
     * @param deletedLines List of deleted line IDs.
     * @return An `AnnotationRequest` object with the provided values.
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
     *
     * - Mocks `geometryService.annotate()` to return a success response.
     * - Creates an annotation request with sample points and lines.
     * - Sends a `POST` request to `/geometry/annotate`.
     * - Expects `HTTP 200 OK` response.
     */
    @Test
    public void handlesValidAnnotateRequest() throws Exception {

        Mockito.when(geometryService.annotate(Mockito.any(AnnotationRequest.class)))
                .thenReturn(BaseResponse.success(true));

        List<PointAnnotationRequest> points = new ArrayList<>();
        List<LineAnnotationRequest> lines = new ArrayList<>();
        List<Integer> deletedPoints = new ArrayList<>();
        List<Integer> deletedLines = new ArrayList<>();

        for (int i = 1; i < 4; i++) {
            points.add(new PointAnnotationRequest(i, 1.0 * i, 1.0 * i, null));
            lines.add(new LineAnnotationRequest(i, i, i + 1));
            deletedPoints.add(2 * i);
            deletedLines.add(2 * i);
        }

        // Use factory method to create the request
        AnnotationRequest request = createAnnotationRequest(
                1L,
                2,
                points,
                lines,
                deletedPoints,
                deletedLines
        );

        String requestBody = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/geometry/annotate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    /**
     * Tests that a request missing `origamiId` is rejected with a `400 Bad Request`.
     *
     * - Creates an annotation request with a `null` `origamiId`.
     * - Sends a `POST` request to `/geometry/annotate`.
     * - Expects `HTTP 400 Bad Request` response.
     */
    @Test
    public void handlesInvalidAnnotateRequest_MissingOrigamiId() throws Exception {
        List<PointAnnotationRequest> points = new ArrayList<>();
        List<LineAnnotationRequest> lines = new ArrayList<>();
        List<Integer> deletedPoints = new ArrayList<>();
        List<Integer> deletedLines = new ArrayList<>();

        for (int i = 1; i < 4; i++) {
            points.add(new PointAnnotationRequest(i, 1.0 * i, 1.0 * i, null));
            lines.add(new LineAnnotationRequest(i, i, i + 1));
            deletedPoints.add(2 * i);
            deletedLines.add(2 * i);
        }

        // Use factory method to create the request
        AnnotationRequest invalidRequest = createAnnotationRequest(
                null,
                2,
                points,
                lines,
                deletedPoints,
                deletedLines
        );

        String requestBody = objectMapper.writeValueAsString(invalidRequest);

        mockMvc.perform(post("/geometry/annotate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    // Uncommented tests can be used as needed
    // @Test
    // public void handlesInvalidAnnotateRequest_MissingStepIdInOrigami() throws Exception {
    //     String invalidRequest = """
    //         {
    //             "origamiId": 1
    //         }
    //         """;
    //
    //     mockMvc.perform(post("/geometry/annotate")
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(invalidRequest))
    //             .andExpect(status().isBadRequest())
    //             .andExpect(jsonPath("$.message").value("Field 'stepIdInOrigami' in Annotate must not be null"));
    // }

    // @Test
    // public void handlesEmptyRequest() throws Exception {
    //     String emptyRequest = "{}";
    //
    //     mockMvc.perform(post("/geometry/annotate")
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(emptyRequest))
    //             .andExpect(status().isBadRequest())
    //             .andExpect(jsonPath("$.message").value("Field 'origamiId' in Annotate must not be null"));
    // }
}