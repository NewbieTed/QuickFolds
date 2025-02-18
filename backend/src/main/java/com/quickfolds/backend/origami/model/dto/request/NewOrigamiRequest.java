package com.quickfolds.backend.origami.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewOrigamiRequest {
    @NotNull(message = "Field 'userId' in New Origami Request must not be null")
    @PositiveOrZero(message = "Field 'userId' in New Origami Request must be non-negative")
    private Long userId;

    @NotNull(message = "Field 'origamiId' in Annotate Request must not be null")
    private String origamiName;
}
