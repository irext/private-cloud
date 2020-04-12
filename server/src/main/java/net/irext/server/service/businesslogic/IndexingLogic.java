package net.irext.server.service.businesslogic;

import com.google.gson.Gson;
import com.squareup.okhttp.*;
import net.irext.server.service.Constants;
import net.irext.server.service.mapper.*;
import net.irext.server.service.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Filename:       IndexingLogic
 * Revised:        Date: 2019-06-08
 * Revision:       Revision: 1.0
 * <p>
 * Description:    IRext private server indexing logic
 * <p>
 * Revision log:
 * 2019-06-08: created by strawmanbobi
 */
@Controller
public class IndexingLogic {

    private CategoryMapper categoryMapper;

    private BrandMapper brandMapper;

    private CityMapper cityMapper;

    private StbOperatorMapper stbOperatorMapper;

    private RemoteIndexMapper remoteIndexMapper;

    private CollectRemoteMapper collectRemoteMapper;

    @Autowired
    public void setCategoryMapper(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    @Autowired
    public void setBrandMapper(BrandMapper brandMapper) {
        this.brandMapper = brandMapper;
    }

    @Autowired
    public void setCityMapper(CityMapper cityMapper) {
        this.cityMapper = cityMapper;
    }

    @Autowired
    public void setStbOperatorMapper(StbOperatorMapper stbOperatorMapper) {
        this.stbOperatorMapper = stbOperatorMapper;
    }

    @Autowired
    public void setRemoteIndexMapper(RemoteIndexMapper remoteIndexMapper) {
        this.remoteIndexMapper = remoteIndexMapper;
    }

    @Autowired
    public void setCollectRemoteMapper(CollectRemoteMapper collectRemoteMapper) {
        this.collectRemoteMapper = collectRemoteMapper;
    }

    private static final String IR_BIN_FILE_PREFIX = "irda_";
    private static final String IR_BIN_FILE_SUFFIX = ".bin";

    public RemoteIndex getRemoteIndex(int indexId) {
        List<RemoteIndex> remoteIndexList = remoteIndexMapper.getRemoteIndexById(indexId);
        if (null != remoteIndexList && remoteIndexList.size() > 0) {
            return remoteIndexList.get(0);
        }
        return null;
    }

    public List<Category> listCategories(int lang, int from, int count) {
        List<Category> categoryList = categoryMapper.listCategories(from, count);
        if (lang == Constants.LANG_EN) {
            for (Category category : categoryList) {
                category.setName(category.getNameEn());
            }
        } else if (lang == Constants.LANG_TW_CN) {
            for (Category category : categoryList) {
                category.setName(category.getNameTw());
            }
        }
        return categoryList;
    }

    public List<Brand> listBrands(int lang, int categoryId, int from, int count) {
        List<Brand> brandList = brandMapper.listBrands(categoryId, from, count);
        if (lang == Constants.LANG_EN) {
            for (Brand brand : brandList) {
                brand.setName(brand.getNameEn());
            }
        } else if (lang == Constants.LANG_TW_CN) {
            for (Brand brand : brandList) {
                brand.setName(brand.getNameTw());
            }
        }
        return brandList;
    }

    public List<City> listProvinces() {
        return cityMapper.listProvinces();
    }

    public List<City> listCities(String provincePrefix) {
        String provincePrefixText = provincePrefix + "__00";
        return cityMapper.listCities(provincePrefixText);
    }

    public List<StbOperator> listOperators(String cityCode) {
        return stbOperatorMapper.listOperators(cityCode);
    }

    public List<RemoteIndex> listRemoteIndexes(int categoryId, int brandId, String cityCode,
                                               int from, int count, int withParaData) {
        List<RemoteIndex> remoteIndexList;
        if (categoryId == Constants.CategoryID.STB.getValue()) {
            remoteIndexList = remoteIndexMapper.listRemoteIndexByCity(cityCode, from, count);
        } else {
            remoteIndexList = remoteIndexMapper.listRemoteIndexByBrand(categoryId, brandId, from, count);
        }

        if (1 == withParaData) {
            List<CollectRemote> collectRemoteList;

            if (Constants.CategoryID.STB.getValue() != categoryId) {
                collectRemoteList = collectRemoteMapper.selectCollectRemotesByBrand(categoryId, brandId);
            } else {
                collectRemoteList = collectRemoteMapper.selectCollectRemotesByCity(categoryId, cityCode);
            }

            // convert collectRemote to remoteIndex
            for (CollectRemote collectRemote : collectRemoteList) {
                RemoteIndex remoteIndex = new RemoteIndex();
                remoteIndex.setId(collectRemote.getId());
                remoteIndex.setCategoryId(categoryId);
                remoteIndex.setCategoryName(collectRemote.getCategoryName());
                remoteIndex.setBrandId(brandId);
                remoteIndex.setBrandName(collectRemote.getBrandName());
                remoteIndex.setCityCode(collectRemote.getCityCode());
                remoteIndex.setCityName(collectRemote.getCityName());
                remoteIndex.setPriority(999);
                remoteIndex.setSubCate((byte)Constants.BinaryType.TYPE_PARA_DATA.getValue());
                remoteIndex.setStatus((byte) Constants.STATUS_PARA_DATA);
                remoteIndexList.add(remoteIndex);
            }
        }
        return remoteIndexList;
    }

    public String statRemoteRef(int remoteIndexId) {
        List<RemoteIndex> remoteIndexList = remoteIndexMapper.getRemoteIndexById(remoteIndexId);
        if (null != remoteIndexList && remoteIndexList.size() > 0) {
            return statRemoteRef(remoteIndexList.get(0));
        }
        return null;
    }

    public String statRemoteRef(RemoteIndex remoteIndex) {
        try {
            String url = "https://irext.net/irext/stat/stat_remotes";
            MediaType JSON
                    = MediaType.parse("application/json; charset=utf-8");

            OkHttpClient client = new OkHttpClient();

            RemoteRef remoteRef = new RemoteRef();
            remoteRef.setCategory_id(remoteIndex.getCategoryId());
            remoteRef.setCategory_name(remoteIndex.getCategoryName());
            remoteRef.setBrand_id(remoteIndex.getBrandId());
            remoteRef.setBrand_name(remoteIndex.getBrandName());
            remoteRef.setCity_code(remoteIndex.getCityCode());
            remoteRef.setOperator_id(remoteIndex.getOperatorId());
            remoteRef.setRemote_code(remoteIndex.getId().toString());
            remoteRef.setRemote(remoteIndex.getRemote());
            remoteRef.setProtocol(remoteIndex.getProtocol());
            remoteRef.setRemote_map(remoteIndex.getRemoteMap());
            remoteRef.setStatus(1);
            remoteRef.setSub_cate(remoteIndex.getSubCate());
            if (remoteRef.getCategory_id() != Constants.CategoryID.STB.getValue()) {
                remoteRef.setName(remoteIndex.getCategoryName() + remoteIndex.getBrandName());
            } else {
                remoteRef.setName(remoteIndex.getCategoryName() + remoteIndex.getOperatorName());
            }
            remoteRef.setCreate_type(1);

            String remoteRefBody = new Gson().toJson(remoteRef);

            RequestBody body = RequestBody.create(JSON, remoteRefBody);
            Request request = new Request.Builder()
                    .url(url)
                    .post(body)
                    .build();
            Response response = client.newCall(request).execute();
            return response.body().string();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return  null;
    }

    private static class RemoteRef {
        String name;
        int category_id;
        String category_name;
        int brand_id;
        String brand_name;
        String city_code;
        String operator_id;
        int status;
        String remote_code;
        int create_type;
        String update_time;
        int sub_cate;
        String protocol;
        String remote;
        String remote_map;

        public void remoteRef() {
        }

        public void remoteRef(String name,
                              int category_id, String category_name, int brand_id, String brand_name,
                              String city_code, String operator_id,
                              int status, String remote_code, int create_type, String update_time,
                              int sub_cate, String protocol, String remote, String remote_map) {
            this.name = name;
            this.category_id = category_id;
            this.category_name = category_name;
            this.brand_id = brand_id;
            this.brand_name = brand_name;
            this.city_code = city_code;
            this.operator_id = operator_id;
            this.status = status;
            this.remote_code = remote_code;
            this.create_type = create_type;
            this.update_time = update_time;
            this.sub_cate = sub_cate;
            this.protocol = protocol;
            this.remote = remote;
            this.remote_map = remote_map;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getCategory_id() {
            return category_id;
        }

        public void setCategory_id(int category_id) {
            this.category_id = category_id;
        }

        public String getCategory_name() {
            return category_name;
        }

        public void setCategory_name(String category_name) {
            this.category_name = category_name;
        }

        public int getBrand_id() {
            return brand_id;
        }

        public void setBrand_id(int brand_id) {
            this.brand_id = brand_id;
        }

        public String getBrand_name() {
            return brand_name;
        }

        public void setBrand_name(String brand_name) {
            this.brand_name = brand_name;
        }

        public String getCity_code() {
            return city_code;
        }

        public void setCity_code(String city_code) {
            this.city_code = city_code;
        }

        public String getOperator_id() {
            return operator_id;
        }

        public void setOperator_id(String operator_id) {
            this.operator_id = operator_id;
        }

        public int getStatus() {
            return status;
        }

        public void setStatus(int status) {
            this.status = status;
        }

        public String getRemote_code() {
            return remote_code;
        }

        public void setRemote_code(String remote_code) {
            this.remote_code = remote_code;
        }

        public int getCreate_type() {
            return create_type;
        }

        public void setCreate_type(int create_type) {
            this.create_type = create_type;
        }

        public String getUpdate_time() {
            return update_time;
        }

        public void setUpdate_time(String update_time) {
            this.update_time = update_time;
        }

        public int getSub_cate() {
            return sub_cate;
        }

        public void setSub_cate(int sub_cate) {
            this.sub_cate = sub_cate;
        }

        public String getProtocol() {
            return protocol;
        }

        public void setProtocol(String protocol) {
            this.protocol = protocol;
        }

        public String getRemote() {
            return remote;
        }

        public void setRemote(String remote) {
            this.remote = remote;
        }

        public String getRemote_map() {
            return remote_map;
        }

        public void setRemote_map(String remote_map) {
            this.remote_map = remote_map;
        }
    }
}
