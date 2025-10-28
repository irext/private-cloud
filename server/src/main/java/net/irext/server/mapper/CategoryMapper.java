package net.irext.server.mapper;

import net.irext.server.model.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Filename:       CategoryMapper.java
 * Revised:        Date: 2019-06-12
 * Revision:       Revision: 1.0
 * <p>
 * Description:    CategoryMapper
 * <p>
 * Revision log:
 * 2019-06-12: created by strawmanbobi
 */
@Mapper
@Controller
public interface CategoryMapper {
    @Select("SELECT * FROM category WHERE status = 1 ORDER BY id LIMIT #{from}, #{count}")
    @ResultMap("BaseResultMap")
    List<Category> listCategories(int from, int count);

    @Select("SELECT * FROM category WHERE id = #{id} AND status = 1")
    @ResultMap("BaseResultMap")
    List<Category> getCategoryById(int id);
}
