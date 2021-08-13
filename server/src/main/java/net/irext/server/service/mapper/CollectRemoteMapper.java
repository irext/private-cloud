package net.irext.server.service.mapper;

import net.irext.server.service.model.CollectRemote;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Filename:       CollectRemoteMapper.java
 * Revised:        Date: 2018-12-08
 * Revision:       Revision: 1.0
 * <p>
 * Description:    CollectRemote Mybatis Mapper
 * <p>
 * Revision log:
 * 2018-12-08: created by strawmanbobi
 */
@Mapper
@Controller
public interface CollectRemoteMapper {

    @Select("SELECT * FROM collect_remote WHERE category_id = #{categoryId} AND brand_id = #{brandId} AND status = 2 LIMIT #{from}, #{count}")
    @ResultMap("BaseResultMap")
    List<CollectRemote> selectCollectRemotesByBrand(Integer categoryId, Integer brandId, Integer from, Integer count);

    @Select("SELECT * FROM collect_remote WHERE category_id = #{categoryId} AND city_code = #{cityCode} AND status = 2 LIMIT #{from}, #{count}")
    @ResultMap("BaseResultMap")
    List<CollectRemote> selectCollectRemotesByCity(Integer categoryId, String cityCode, Integer from, Integer count);
}
