package net.irext.server.service.mapper;

import net.irext.server.service.model.Brand;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Filename:       BrandMapper.java
 * Revised:        Date: 2019-06-21
 * Revision:       Revision: 1.0
 * <p>
 * Description:    BrandMapper
 * <p>
 * Revision log:
 * 2019-06-21: created by strawmanbobi
 */
@Mapper
@Controller
public interface BrandMapper {
    @Select("SELECT * FROM brand WHERE status = 1 AND category_id = #{categoryId} ORDER BY priority LIMIT #{from}, #{count}")
    @ResultMap("BaseResultMap")
    List<Brand> listBrands(int categoryId, int from, int count);
}
