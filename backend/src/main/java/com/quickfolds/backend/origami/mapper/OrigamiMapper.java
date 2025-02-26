package com.quickfolds.backend.origami.mapper;

import com.quickfolds.backend.origami.model.database.Origami;
import com.quickfolds.backend.origami.model.dto.response.OrigamiResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to origami models.
 * <p>
 * This interface provides methods for inserting and retrieving origami models
 * from the database. It uses MyBatis annotations for mapping SQL queries
 * to Java methods, ensuring efficient interaction with the database.
 * <p>
 * Key functionalities:
 * <ul>
 *     <li>Insert new origami models.</li>
 *     <li>Retrieve public origami IDs and detailed responses.</li>
 *     <li>Fetch the most recently created origami by a specific user.</li>
 * </ul>
 * <p>
 * Dependencies:
 * - {@link Origami}: The database entity representing an origami model.
 * - {@link OrigamiResponse}: The DTO used for returning public origami details.
 */
@Mapper
public interface OrigamiMapper {

    /**
     * Retrieves the database ID of the most recently created origami model by a specific user.
     * <p>
     * This method helps track the latest origami model created by a user, often used for
     * further processing or displaying recent user activity.
     *
     * @param userId The ID of the user who created the origami.
     * @return The database ID of the most recently created origami model, or {@code null} if none exist.
     */
    Long getMostRecentId(@Param("userId") Long userId);

    /**
     * Retrieves a list of IDs for all publicly available origami models.
     * <p>
     * This method returns only the unique IDs of publicly shared origami models,
     * ensuring that full details are not exposed unless explicitly requested.
     *
     * @return A list of origami model IDs that are publicly accessible, or an empty list if none exist.
     */
    List<Long> getPublicOrigamiIds();

    /**
     * Retrieves a list of public origami models with detailed information.
     * <p>
     * This method returns the full details of each publicly available origami model,
     * formatted as {@link OrigamiResponse} objects for easy consumption by the frontend.
     *
     * @return A list of {@link OrigamiResponse} objects representing public origami models,
     *         or an empty list if no public origami exist.
     */
    List<OrigamiResponse> getPublicOrigamis();

    /**
     * Inserts a new origami model into the database.
     * <p>
     * This method adds an {@link Origami} entity to the database, representing a newly created origami model.
     * The inserted record is associated with the user who created the origami.
     *
     * @param origami The {@link Origami} entity representing the new origami model to be inserted.
     */
    void addByObj(@Param("origami") Origami origami);
}