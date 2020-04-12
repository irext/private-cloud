package net.irext.server.service.mapper;

import net.irext.server.service.model.RemoteIndex;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Filename:       RemoteIndexMapper.java
 * Revised:        Date: 2018-12-08
 * Revision:       Revision: 1.0
 * <p>
 * Description:    RemoteIndexMapper
 * <p>
 * Revision log:
 * 2018-12-08: created by strawmanbobi
 */
@Mapper
@Controller
public interface RemoteIndexMapper {
    @Select("SELECT * FROM remote_index WHERE id = #{id}")
    @ResultMap("BaseResultMap")
    List<RemoteIndex> getRemoteIndexById(int id);

    @Select("SELECT * FROM remote_index WHERE city_code = #{cityCode} ORDER BY priority LIMIT #{from}, #{count}")
    @ResultMap("BaseResultMap")
    List<RemoteIndex> listRemoteIndexByCity(String cityCode, int from, int count);

    @Select("SELECT * FROM remote_index WHERE category_id = #{categoryId} AND brand_id = #{brandId} " +
            "ORDER BY priority LIMIT #{from}, #{count}")
    @ResultMap("BaseResultMap")
    List<RemoteIndex> listRemoteIndexByBrand(int categoryId, int brandId, int from, int count);
}
