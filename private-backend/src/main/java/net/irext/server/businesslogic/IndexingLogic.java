package net.irext.server.businesslogic;

import com.google.gson.Gson;
import com.squareup.okhttp.*;
import net.irext.server.request.CreateRemoteReferenceRequest;
import net.irext.server.utils.Constants;
import net.irext.server.mapper.*;
import net.irext.server.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
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
        List<RemoteIndex> remoteIndexList = new ArrayList<>();
        if (categoryId == Constants.CategoryID.STB.getValue()) {
            remoteIndexList = remoteIndexMapper.listRemoteIndexByCity(cityCode, from, count);
        } else {
            remoteIndexList = remoteIndexMapper.listRemoteIndexByBrand(categoryId, brandId, from, count);
        }

        return remoteIndexList;
    }

    public List<RemoteIndex> listCollectedRemoteIndexes(int categoryId, int brandId, String cityCode,
                                               int from, int count) {
        List<RemoteIndex> remoteIndexList = new ArrayList<>();
        List<CollectRemote> collectRemoteList;

        if (Constants.CategoryID.STB.getValue() != categoryId) {
            collectRemoteList = collectRemoteMapper.selectCollectRemotesByBrand(categoryId, brandId, from, count);
        } else {
            collectRemoteList = collectRemoteMapper.selectCollectRemotesByCity(categoryId, cityCode, from, count);
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
        return remoteIndexList;
    }

    public String statRemoteRef(int remoteIndexId, int id, String token) {
        List<RemoteIndex> remoteIndexList = remoteIndexMapper.getRemoteIndexById(remoteIndexId);
        if (null != remoteIndexList && remoteIndexList.size() > 0) {
            return statRemoteRef(remoteIndexList.get(0), id, token);
        }
        return null;
    }

    public String statRemoteRef(RemoteIndex remoteIndex, int id, String token) {
        try {
            String url = Constants.REMOTE_REF_URL;
            MediaType JSON
                    = MediaType.parse("application/json; charset=utf-8");

            OkHttpClient client = new OkHttpClient();

            List<Category> categoryList;
            List<Brand> brandList;
            String categoryName = null;
            String brandName = null;

            categoryList = categoryMapper.getCategoryById(remoteIndex.getCategoryId());
            if (null == categoryList || categoryList.size() <= 0) {
                return null;
            }
            categoryName = categoryList.get(0).getName();
            brandList = brandMapper.getBrandById(remoteIndex.getBrandId());
            if (null == brandList || brandList.size() <= 0) {
                return null;
            }
            brandName = brandList.get(0).getName();

            RemoteRef remoteRef = new RemoteRef();
            remoteRef.setCategoryId(remoteIndex.getCategoryId());
            remoteRef.setCategoryName(categoryName);
            remoteRef.setBrandId(remoteIndex.getBrandId());
            remoteRef.setBrandName(brandName);
            remoteRef.setCityCode(remoteIndex.getCityCode());
            remoteRef.setOperatorId(remoteIndex.getOperatorId());
            remoteRef.setRemoteCode(remoteIndex.getId().toString());
            remoteRef.setRemote(remoteIndex.getRemote());
            remoteRef.setProtocol(remoteIndex.getProtocol());
            remoteRef.setRemoteMap(remoteIndex.getRemoteMap());
            remoteRef.setStatus((byte) Constants.STATUS_VALID);
            remoteRef.setSubCate(remoteIndex.getSubCate());
            if (remoteRef.getCategoryId() != Constants.CategoryID.STB.getValue()) {
                remoteRef.setName(remoteIndex.getBrandName() + categoryName);
            } else {
                remoteRef.setName(remoteIndex.getOperatorName() + categoryName);
            }
            remoteRef.setCreateType((byte) Constants.CREATE_TYPE_SOURCE);
            CreateRemoteReferenceRequest createRemoteRefRequest = new CreateRemoteReferenceRequest(id, token, remoteRef);

            String remoteRefBody = new Gson().toJson(createRemoteRefRequest);

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
}
