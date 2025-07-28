package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const (
	FacebookAPIBaseURL = "https://graph.facebook.com/v18.0"
)

// FacebookService maneja la integración con Facebook Graph API
type FacebookService struct {
	client *http.Client
}

func NewFacebookService() *FacebookService {
	return &FacebookService{
		client: &http.Client{
			Timeout: time.Second * 30,
		},
	}
}

// GetUserInfo obtiene información del usuario de Facebook
func (f *FacebookService) GetUserInfo(accessToken string) (*FacebookUserInfo, error) {
	url := fmt.Sprintf("%s/me?fields=id,name,email&access_token=%s", FacebookAPIBaseURL, accessToken)

	resp, err := f.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error al obtener información del usuario: %d", resp.StatusCode)
	}

	var userInfo FacebookUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

// GetUserGroups obtiene los grupos donde el usuario puede publicar
func (f *FacebookService) GetUserGroups(accessToken string) ([]FacebookGroupInfo, error) {
	url := fmt.Sprintf("%s/me/groups?fields=id,name,description,member_count,privacy&access_token=%s", FacebookAPIBaseURL, accessToken)

	resp, err := f.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error al obtener grupos: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var response struct {
		Data []FacebookGroupInfo `json:"data"`
	}

	if err := json.Unmarshal(body, &response); err != nil {
		return nil, err
	}

	return response.Data, nil
}

// PostToGroup publica un mensaje en un grupo de Facebook
func (f *FacebookService) PostToGroup(accessToken, groupID string, req FacebookPostRequest) (*FacebookPostResponse, error) {
	// Construir datos del formulario
	data := url.Values{}
	data.Set("message", req.Message)
	if req.Link != "" {
		data.Set("link", req.Link)
	}
	data.Set("access_token", accessToken)

	// URL de la API
	apiURL := fmt.Sprintf("%s/%s/feed", FacebookAPIBaseURL, groupID)

	// Crear petición
	resp, err := f.client.PostForm(apiURL, data)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error al publicar en grupo: %d - %s", resp.StatusCode, string(body))
	}

	var response FacebookPostResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, err
	}

	return &response, nil
}

// PostWithPhoto publica un mensaje con foto en un grupo
func (f *FacebookService) PostWithPhoto(accessToken, groupID string, req FacebookPostRequest, imageData []byte) (*FacebookPostResponse, error) {
	// Para publicaciones con foto, necesitamos usar multipart/form-data
	// Esto es más complejo, por ahora implementamos solo texto
	return f.PostToGroup(accessToken, groupID, req)
}

// ValidateAccessToken valida si el token de acceso es válido
func (f *FacebookService) ValidateAccessToken(accessToken string) (bool, error) {
	url := fmt.Sprintf("%s/me?access_token=%s", FacebookAPIBaseURL, accessToken)

	resp, err := f.client.Get(url)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK, nil
}

// GetTokenInfo obtiene información sobre el token de acceso
func (f *FacebookService) GetTokenInfo(accessToken string) (*FacebookTokenInfo, error) {
	url := fmt.Sprintf("%s/debug_token?input_token=%s&access_token=%s", FacebookAPIBaseURL, accessToken, accessToken)

	resp, err := f.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error al obtener información del token: %d", resp.StatusCode)
	}

	var response struct {
		Data FacebookTokenInfo `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	return &response.Data, nil
}

// RefreshLongLivedToken convierte un token de corta duración en uno de larga duración
func (f *FacebookService) RefreshLongLivedToken(accessToken, appID, appSecret string) (*FacebookTokenInfo, error) {
	url := fmt.Sprintf("%s/oauth/access_token?grant_type=fb_exchange_token&client_id=%s&client_secret=%s&fb_exchange_token=%s",
		FacebookAPIBaseURL, appID, appSecret, accessToken)

	resp, err := f.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error al renovar token: %d", resp.StatusCode)
	}

	var tokenInfo FacebookTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&tokenInfo); err != nil {
		return nil, err
	}

	return &tokenInfo, nil
}

// GetPostInsights obtiene estadísticas de una publicación
func (f *FacebookService) GetPostInsights(accessToken, postID string) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/%s/insights?access_token=%s", FacebookAPIBaseURL, postID, accessToken)

	resp, err := f.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error al obtener estadísticas: %d", resp.StatusCode)
	}

	var insights map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&insights); err != nil {
		return nil, err
	}

	return insights, nil
}
