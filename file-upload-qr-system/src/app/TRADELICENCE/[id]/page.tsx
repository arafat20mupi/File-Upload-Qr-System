
const page = async ({ params }: { params: { id: string } }) => {
    const { id } = await params;
    const file = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const fileData = await file.json();
    return (
        <div>
            {/* PDF & Image Viewer */}
            {fileData.url.endsWith('.pdf') ?
                (<iframe src={fileData.url} width="100%" height="750px"></iframe>) :
                (<img src={fileData.url} alt={fileData.name} style={{ maxWidth: '100%' }} />)
            }
        </div>
    );
};

export default page;