import React, { useEffect, useState } from "react";
import { TextField, Button, Chip, Box, Typography, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import axios from "axios";
import { BASE_URL, X_API_KEY } from "src/components/Urls/BaseApiUrls";
import Cookies from "js-cookie";

interface SinglePrDetailsFormProps {
  orderId: number;
}

interface Company {
  id: number;
  companyName: string;
}

const SinglePrDetailsForm: React.FC<SinglePrDetailsFormProps> = ({ orderId }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  useEffect(() => {
    const userTokenString = Cookies.get('user');
    console.log('User Token String:', userTokenString); // Debugging line
    if (userTokenString) {
      try {
        const userToken = JSON.parse(userTokenString);
        setToken(userToken.token);
      } catch (error) {
        console.error('Error parsing user token:', error);
      }
    }
  }, []);
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get<Company[]>(`${BASE_URL}/v1/company/company-list`, {
          headers: {
            "x-api-key": X_API_KEY,
            "Authorization": `Bearer ${token}`,
          }
        });
        setCompanies(response.data);
      } catch (error) {
        console.error("Failed to fetch companies", error);
      }
    };
    if (token) {
      fetchCompanies();
    }
  }, [token]); 



  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleSelectCompany = (event: SelectChangeEvent<string>) => {
    setSelectedCompany(event.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", { orderId, tags, url, selectedCompany });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <TextField
          fullWidth
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-white rounded-lg"
        />
      </div>
      <div className="space-y-2">
        <TextField
          fullWidth
          label="Add Tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
          className="bg-white rounded-lg"
        />
        <Button onClick={handleAddTag} variant="outlined" size="small">
          Add Tag
        </Button>
      </div>
      <Box className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} />
        ))}
      </Box>
      <FormControl fullWidth className="mt-4">
        <InputLabel id="company-select-label">Company</InputLabel>
        <Select
          labelId="company-select-label"
          id="company-select"
          value={selectedCompany}
          label="Company"
          onChange={handleSelectCompany}
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id.toString()}>
              {company.companyName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
        Save PR Details
      </Button>
    </form>
  );
};

export default SinglePrDetailsForm;
