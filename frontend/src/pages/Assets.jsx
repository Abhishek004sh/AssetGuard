import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";

import {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    uploadInvoice
} from "../services/asset.service";



function Assets(){

    const emptyForm = {
        name:"",
        category:"",
        description:"",
        purchaseDate:"",
        purchasePrice:"",
        warrantyExpiry:"",
        serialNumber:""
    };

    const [form,setForm] = useState(emptyForm);

    const [assets,setAssets] = useState([]);
    const [editing,setEditing] = useState(null);

    const [search,setSearch] = useState("");
    const [page,setPage] = useState(1);
    const [pagination,setPagination] = useState({ total:0, page:1, pages:1 });

    const [invoiceFiles,setInvoiceFiles] = useState({});
    const [uploadingId,setUploadingId] = useState(null);

    const [saving,setSaving] = useState(false);


    const handleChange=(e)=>{

        setForm({

            ...form,

            [e.target.name]:
            e.target.value

        });

    };

    const loadAssets = async () => {

        const data = await getAssets({
            search,
            page,
            limit: 10
        });

        setAssets(data.assets);

        setPagination(data.pagination);

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);

        try{

            if (editing) {

                const data = await updateAsset(
                    editing._id,
                    form
                );

                setAssets(
                    assets.map(asset =>
                        asset._id === editing._id
                            ? data.asset
                            : asset
                    )
                );

                setEditing(null);

            } else {

                await createAsset(form);

                await loadAssets();

            }

            setForm(emptyForm);

        }
        finally{

            setSaving(false);

        }

    };

    const handleDelete = async (id) => {

        await deleteAsset(id);

        setAssets(
            assets.filter(
                asset => asset._id !== id
            )
        );

    };

    const handleEdit = (asset) => {

        setEditing(asset);

        setForm({
            name: asset.name,
            category: asset.category,
            description: asset.description || "",
            purchaseDate: asset.purchaseDate?.slice(0, 10) || "",
            purchasePrice: asset.purchasePrice,
            warrantyExpiry: asset.warrantyExpiry?.slice(0, 10) || "",
            serialNumber: asset.serialNumber || ""
        });

    };

    const handleCancelEdit = () => {

        setEditing(null);

        setForm(emptyForm);

    };

    const handleInvoiceFileChange = (assetId, file) => {

        setInvoiceFiles({
            ...invoiceFiles,
            [assetId]: file
        });

    };

    const handleInvoiceUpload = async (assetId) => {

        const file = invoiceFiles[assetId];

        if(!file) return;

        setUploadingId(assetId);

        try{

            const data = await uploadInvoice(assetId, file);

            setAssets(
                assets.map(asset =>
                    asset._id === assetId
                        ? { ...asset, invoiceUrl: data.invoiceUrl }
                        : asset
                )
            );

        }
        finally{

            setUploadingId(null);

        }

    };


    useEffect(()=>{

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAssets();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[page]);

    const handleSearchSubmit = (e) => {

        e.preventDefault();

        setPage(1);

        loadAssets();

    };


    return (

        <Layout>


            <h1 className="text-3xl font-bold mb-6">
                Assets
            </h1>

            <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">

                <input
                placeholder="Search assets by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded flex-1"
                />

                <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                    Search
                </button>

            </form>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-5 rounded-xl shadow mb-6"
                >

                <h2 className="font-semibold mb-3 text-gray-700">
                    {editing ? "Edit Asset" : "Add New Asset"}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <input
                    name="name"
                    placeholder="Asset Name"
                    value={form.name}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                    />


                    <input
                    name="category"
                    placeholder="Category"
                    value={form.category}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                    />


                    <input
                    name="purchasePrice"
                    type="number"
                    placeholder="Purchase Price"
                    value={form.purchasePrice}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                    />

                    <input
                    name="serialNumber"
                    placeholder="Serial Number (optional)"
                    value={form.serialNumber}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    />

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Purchase Date
                        </label>
                        <input
                        name="purchaseDate"
                        type="date"
                        value={form.purchaseDate}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                        required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Warranty Expiry
                        </label>
                        <input
                        name="warrantyExpiry"
                        type="date"
                        value={form.warrantyExpiry}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                        required
                        />
                    </div>

                </div>

                <textarea
                name="description"
                placeholder="Description (optional)"
                value={form.description}
                onChange={handleChange}
                className="border p-2 rounded w-full mt-3"
                rows="2"
                />

                <div className="flex gap-2 mt-4">

                    <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
                    >
                        {saving
                            ? "Saving..."
                            : editing ? "Update Asset" : "Add Asset"
                        }
                    </button>

                    {editing && (

                        <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-300 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>

                    )}

                </div>


            </form>

            <div className="grid gap-4">


                {assets.length === 0 && (

                    <div className="bg-white p-5 rounded-xl shadow text-gray-500">
                        No assets yet. Add your first one above.
                    </div>

                )}

                {
                    assets.map((asset)=>(


                        <div
                        key={asset._id}
                        className="bg-white p-5 rounded-xl shadow"
                        >

                            <div className="flex justify-between items-start flex-wrap gap-2">

                                <div>

                                    <h2 className="text-xl font-bold">
                                        {asset.name}
                                    </h2>

                                    <p className="text-gray-500 text-sm">
                                        {asset.category}
                                    </p>

                                </div>

                                <div>

                                    <button
                                        onClick={() => handleEdit(asset)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 text-sm"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(asset._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>


                            <p className="mt-2">
                                ₹ {asset.purchasePrice}
                            </p>

                            {asset.serialNumber && (
                                <p className="text-sm text-gray-500">
                                    Serial: {asset.serialNumber}
                                </p>
                            )}

                            <p className="text-sm text-gray-500">
                                Warranty till: {asset.warrantyExpiry?.slice(0, 10)}
                            </p>

                            <div className="mt-3 pt-3 border-t">

                                {asset.invoiceUrl ? (

                                    <a
                                    href={asset.invoiceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 text-sm underline"
                                    >
                                        View uploaded invoice
                                    </a>

                                ) : (

                                    <div className="flex items-center gap-2">

                                        <input
                                        type="file"
                                        onChange={(e) =>
                                            handleInvoiceFileChange(asset._id, e.target.files[0])
                                        }
                                        className="text-sm"
                                        />

                                        <button
                                        onClick={() => handleInvoiceUpload(asset._id)}
                                        disabled={uploadingId === asset._id}
                                        className="bg-gray-800 text-white px-3 py-1 rounded text-sm disabled:opacity-60"
                                        >
                                            {uploadingId === asset._id ? "Uploading..." : "Upload Invoice"}
                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>


                    ))
                }


            </div>

            {pagination.pages > 1 && (

                <div className="flex justify-center gap-2 mt-6">

                    <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 rounded border disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span className="px-3 py-1 text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                    </span>

                    <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 rounded border disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>

            )}


        </Layout>

    );

}


export default Assets;
